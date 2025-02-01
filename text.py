import os
import cv2
import pyaudio
import wave
import threading
from geopy.geocoders import OpenCage
from moviepy import VideoFileClip, AudioFileClip
from flask import Flask, render_template, redirect, url_for, request
from email.message import EmailMessage
import smtplib

app = Flask(__name__)

file_path1 = "audio.wav"
file_path2 = "video.mp4"
file_path3 = "output_video.mp4"

# Delete any pre-existing files
try:
    if os.path.exists(file_path1):
        os.remove(file_path1)
        os.remove(file_path2)
        os.remove(file_path3)
        print(f"Files deleted successfully.")
except:
    print(f"Files not found.")

# def get_location_opencage(api_key, address="New York, USA"):
#     geolocator = OpenCage(api_key)
#     location = geolocator.geocode(address)
#     if location:
#         return location.latitude, location.longitude
#     else:
#         return None, None

# api_key = "b9a6d0c6e65240f9a166b07e54ef6ccb"
# latitude, longitude = get_location_opencage(api_key)

import requests
import json

send_url = "http://api.ipstack.com/check?access_key=f6ab5a3b2a297b13ceaa589ba2d6172f"
geo_req = requests.get(send_url)
geo_json = json.loads(geo_req.text)
latitude = geo_json['latitude']
longitude = geo_json['longitude']
city = geo_json['city']
zip = geo_json['zip']

duration = 10

# Function to record video using OpenCV
def record_video(filename="video.mp4", duration=duration-1):
    cap = cv2.VideoCapture(0)
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    frame_rate = 30
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    out = cv2.VideoWriter(filename, fourcc, frame_rate, (width, height))

    frame_count = 0
    max_frames = int(frame_rate * duration)

    print("Recording video...")
    while frame_count < max_frames:
        ret, frame = cap.read()
        if ret:
            out.write(frame)
            frame_count += 1
        else:
            break

    cap.release()
    out.release()
    print(f"Video saved as {filename}")

# Function to record audio using PyAudio
def record_audio(filename="audio.wav", duration=duration):
    p = pyaudio.PyAudio()
    rate = 50000
    chunk = 1024
    channels = 1
    format = pyaudio.paInt16
    frames = []

    print("Recording audio...")
    stream = p.open(format=format, channels=channels, rate=rate, input=True, frames_per_buffer=chunk)

    for _ in range(0, int(rate / chunk * duration)):
        data = stream.read(chunk)
        frames.append(data)

    stream.stop_stream()
    stream.close()
    p.terminate()

    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(p.get_sample_size(format))
        wf.setframerate(rate)
        wf.writeframes(b''.join(frames))

    print(f"Audio saved as {filename}")

# Function to merge audio and video
def merge_audio_video(video_path, audio_path, output_path):
    video_clip = VideoFileClip(video_path)
    audio_clip = AudioFileClip(audio_path)

    if audio_clip.duration > video_clip.duration:
        audio_clip = audio_clip.subclipped(0, video_clip.duration)

    video_clip = video_clip.with_audio(audio_clip)
    video_clip.write_videofile(output_path, codec="libx264", audio_codec="aac")

# Function to handle both video and audio recording simultaneously
def record_video_audio(duration=duration):
    video_filename = "video.mp4"
    audio_filename = "audio.wav"
    output_filename = "output_video.mp4"

    video_thread = threading.Thread(target=record_video, args=(video_filename, duration))
    audio_thread = threading.Thread(target=record_audio, args=(audio_filename, duration))

    video_thread.start()
    audio_thread.start()

    video_thread.join()
    audio_thread.join()

    merge_audio_video(video_filename, audio_filename, output_filename)

# Function to send email with the video and location
def send_email_with_video():
    email = "psaahas@gmail.com"
    password = "hfhj hvgb psot pzdi"
    recipient = "saahas.pulivarthi@gmail.com"
    subject = "Video and Location Alert"
    body = f"Latitude: {latitude}, Longitude: {longitude}, City: {city}, Zip: {zip}"

    msg = EmailMessage()
    msg["From"] = email
    msg["To"] = recipient
    msg["Subject"] = subject
    msg.set_content(body)

    with open("output_video.mp4", "rb") as file:
        msg.add_attachment(file.read(), maintype="video", subtype="mp4", filename="output_video.mp4")

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(email, password)
        server.send_message(msg)
    print("Email sent successfully!")

# Route to render the page with a button and dropdown
@app.route('/', methods=['GET', 'POST'])
def index():
    global duration
    if request.method == 'POST':
        duration = int(request.form['duration'])
        return render_template('index.html', duration=duration)
    return render_template('index.html', duration=duration)

# Route to handle recording and email sending
@app.route('/start_recording', methods=['POST'])
def start_recording():
    # Check if user confirmed
    if request.form.get('confirm') == 'yes':
        record_video_audio(duration=duration)  # Record video and audio
        send_email_with_video()  # Send email with video and location
        return redirect(url_for('success'))
    else:
        return redirect(url_for('index'))

# Route for success page after email is sent
@app.route('/success')
def success():
    return render_template('success.html')

# Route to go back to the main page
@app.route('/go_back')
def go_back():
    return redirect(url_for('index'))

if __name__ == "__main__":
    app.run(debug=True)