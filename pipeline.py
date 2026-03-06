"""
pipeline.py — Standalone voice demo (mic → STT → LLM → TTS → speaker)
Unidirectional greeting flow: Listen → Delay → Respond → Play → Exit
Uses Sarvam AI for STT/TTS, Aditya model for LLM via Groq.
"""

import os
import sys
import json
import re
import time
import requests
import sounddevice as sd
import wave
if sys.platform == "win32":
    import winsound
from main import groq_client, parse_response, SARVAM_KEY

# ── Config ────────────────────────────────────────────────────────
SAMPLE_RATE = 16000
DURATION    = 5  # seconds to record
RESPONSE_DELAY = 1.5  # seconds to wait before responding

# ─────────────────────────────────────────────────────────────────
# STEP 1 — STT: Record mic → text  (Sarvam Saarika)
# ─────────────────────────────────────────────────────────────────
def record_audio(filename="input.wav"):
    print(f"\nRecording for {DURATION} seconds... Speak now!")
    audio = sd.rec(int(DURATION * SAMPLE_RATE), samplerate=SAMPLE_RATE, channels=1, dtype='int16')
    sd.wait()

    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(audio.tobytes())

    print(f"Recording saved: {filename}")
    return filename

def transcribe_audio(filename="input.wav"):
    print("Sending to Sarvam STT...")
    with open(filename, "rb") as f:
        files    = {"file": (filename, f, "audio/wav")}
        headers  = {"api-subscription-key": SARVAM_KEY}
        data     = {"model": "saarika:v2.5", "language_code": "en-IN"}
        response = requests.post(
            "https://api.sarvam.ai/speech-to-text",
            headers=headers, files=files, data=data, timeout=30,
        )
        response.raise_for_status()

    transcript = response.json().get("transcript", "")
    print(f"You said: {transcript}")
    return transcript

# ─────────────────────────────────────────────────────────────────
# STEP 2 — LLM: text → AI reply  (Groq + Aditya Model)
# ─────────────────────────────────────────────────────────────────
def get_llm_response(user_text):
    """Generate a single, non-repetitive greeting response."""
    print("Sending to Aditya LLM...")

    system_prompt = """You are Omkaar, a warm and welcoming waiter at Mudigonda Sharma Cafe, a South Indian restaurant.
A customer has just greeted you. Respond with a single, engaging welcome monologue. Try to keep it concise. 

Your response should:
1. Welcome them warmly in South Indian style (e.g., "Vanakam, Omkaar here from Mudigonda Sharma Cafe! How may I help you today?")
2. Introduce the cafe briefly
3. Mention a few signature items from the menu (Idlis, Dosas, Vadas, Coffee)
4. Invite them to order
5. Keep it natural, friendly, and under 4 seconds when spoken, and keep it short max 1-2 sentences.

CRITICAL: 
- Generate ONLY ONE response
- Do NOT repeat yourself
- Make it sound like a single, flowing speech
- Be concise and friendly, speak till max 5-6 seconds of audio.

Respond in STRICT JSON format only:
{
  "tts_message": "Your welcome message here"
}"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Customer said: {user_text}"}
    ]

    # Use streaming to avoid token limit issues
    completion = groq_client.chat.completions.create(
        model="openai/gpt-oss-120b",  # Aditya equivalent via Groq
        messages=messages,
        temperature=0.7,  # Lower temp for consistency
        max_completion_tokens=512,  # Shorter max to avoid repetition
        top_p=1,
        stream=True,
    )

    full_reply = ""
    for chunk in completion:
        delta_content = chunk.choices[0].delta.content
        if delta_content:
            full_reply += delta_content

    # Parse the JSON response
    try:
        data = json.loads(full_reply.strip())
        tts_message = data.get("tts_message", full_reply)
    except json.JSONDecodeError:
        # Fallback if JSON parsing fails
        tts_message = full_reply

    # Display
    print("\n" + "-" * 55)
    print("  RESPONSE:")
    print(f"  {tts_message}")
    print("-" * 55)

    return tts_message

# ─────────────────────────────────────────────────────────────────
# STEP 3 — TTS: AI reply → speech  (Sarvam Aditya TTS)
# ─────────────────────────────────────────────────────────────────
def speak(text, filename="output.mp3"):
    """Convert text to speech via Sarvam and play it."""
    print("Sending to Sarvam TTS...")
    headers = {
        "api-subscription-key": SARVAM_KEY,
        "Content-Type": "application/json",
    }
    payload = {
        "text": text,
        "target_language_code": "en-IN",
        "speaker": "aditya",
        "model": "bulbul:v3",
        "pace": 1.4,
        "speech_sample_rate": 22050,
        "output_audio_codec": "mp3",
        "enable_preprocessing": True,
    }

    with requests.post(
        "https://api.sarvam.ai/text-to-speech/stream",
        headers=headers, json=payload, stream=True, timeout=30,
    ) as response:
        response.raise_for_status()
        with open(filename, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)

    print(f"Audio saved: {filename}")

    # Play audio based on OS
    if sys.platform == "darwin":
        os.system(f"afplay {filename}")
    elif sys.platform == "win32":
        # Use Windows default player (handles MP3 natively)
        os.system(f"start {filename}")
    else:
        # Linux: try mpg123, fall back to ffplay
        os.system(f"mpg123 {filename} 2>/dev/null || ffplay -nodisp -autoexit {filename}")

# ─────────────────────────────────────────────────────────────────
# MAIN PIPELINE (Single Turn Greeting Demo)
# ─────────────────────────────────────────────────────────────────
def run_pipeline():
    """Unidirectional greeting flow: listen → delay → respond → play → exit"""
    print("\n" + "=" * 55)
    print("  Mudigonda Sharma Cafe — Voice Pipeline")
    print("  Model: Aditya via Sarvam AI")
    print("=" * 55)

    # Step 1: Record customer greeting
    audio_file = record_audio()
    transcript = transcribe_audio(audio_file)

    if not transcript.strip():
        print("❌ Could not understand audio. Please try again.")
        return

    print(f"✓ Recognized: '{transcript}'")

    # Step 2: Wait for response delay
    print(f"\n⏳ Processing... (waiting {RESPONSE_DELAY}s)")
    time.sleep(RESPONSE_DELAY)

    # Step 3: Generate AI response (single, non-repetitive)
    tts_message = get_llm_response(transcript)

    # Step 4: Convert to speech and play
    speak(tts_message)

    print("\n" + "=" * 55)
    print("  ✓ Pipeline Complete")
    print("=" * 55)
    print("\nTo run again, restart the program.\n")

if __name__ == "__main__":
    run_pipeline()
