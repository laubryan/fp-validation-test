#
# Processing functions
#
import base64
import io
import re

from gtts import gTTS
from io import BytesIO
from PIL import Image

#
# Convert image string to image
#
def convert_image_string(page_image_string):

	# Strip base64 header
	base64_image_string = page_image_string.partition("base64,")[-1]

	# Convert base64 string to byte buffer
	image_buffer = base64.b64decode(base64_image_string)
	page_image = Image.open(io.BytesIO(image_buffer)).convert("RGB")

	return page_image

#
# Convert cell text to base64 audio string
#
def create_audio_string(cell_text):

	# Define base64 audio prefix
	base64_audio_prefix = "data:audio/mp3;base64,"

	# Remember negative numbers
	negative = False
	normalized_text = cell_text.strip()
	if normalized_text.startswith("(") and normalized_text.endswith(")"):
		negative = True

	# Prep cell text
	normalized_text = re.sub(r"[(), ]", "", cell_text) # Remove non-read chars

	# Convert text to audio
	base64_audio_string = ""
	if normalized_text:

		# Don't separate small numbers
		if len(normalized_text) > 2:

			# Space out characters
			normalized_text = " ".join(normalized_text)

			# Say special words
			normalized_text = normalized_text.replace(".", "point")	# Decimal point
			normalized_text = normalized_text.replace("0", "zero")	# Zero
			if negative:
				normalized_text = "minus " + normalized_text # Negative

		# Convert text to speech
		cell_audio = gTTS(text=normalized_text, lang="en", slow=False)

		# Convert audio to base64
		audio_buffer = BytesIO()
		cell_audio.write_to_fp(audio_buffer)
		audio_buffer.seek(0)
		base64_audio_string = base64_audio_prefix + base64.b64encode(audio_buffer.read()).decode("utf-8")

	return base64_audio_string

#
# Convert image to base64 string
#
def create_image_string(cell_image):

	# Define base64 image prefix
	base64_image_prefix = "data:image/png;base64,"

	# Convert image to base64 string
	cell_image_buffer = BytesIO()
	cell_image.save(cell_image_buffer, format="PNG")
	base64_image_string = base64_image_prefix + base64.b64encode(cell_image_buffer.getvalue()).decode("utf-8")

	return base64_image_string
