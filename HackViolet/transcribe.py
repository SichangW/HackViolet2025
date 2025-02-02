import speech_recognition as sr

def transcribe_audio(audio_file_path):
    # Initialize recognizer class (for recognizing the speech)
    recognizer = sr.Recognizer()

    # Load the audio file using AudioFile method
    with sr.AudioFile(audio_file_path) as source:
        # Record the audio from the file
        audio = recognizer.record(source)

    try:
        # Use Google's Web Speech API for recognition
        transcript = recognizer.recognize_google(audio)
        return transcript

    except sr.UnknownValueError:
        # If speech recognition could not understand the audio
        return "Sorry, I could not understand the audio."

    except sr.RequestError as e:
        # If there was an issue with the request to the Google API
        return f"Could not request results from Google Web Speech API; {e}"
