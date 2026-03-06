"""
pipeline.py — Full voice ordering pipeline (STT → LLM → TTS with conversation memory)
Low-latency, multi-turn voice ordering system for Mudigonda Sharma Cafe.
Uses Sarvam AI for STT/TTS, Groq LLM for order processing and memory.
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
from main import groq_client, build_prompt, parse_response, SARVAM_KEY

# ── Config ────────────────────────────────────────────────────────
SAMPLE_RATE = 16000
DURATION    = 5  # seconds to record

conversation_history = []  # Stores full conversation for context

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
# STEP 2 — LLM: text → AI reply  (Groq with conversation memory)
# ─────────────────────────────────────────────────────────────────
def get_llm_response(user_text, system_prompt):
    """Process user input with full conversation history for order management."""
    print("🤖 Processing with LLM...")

    # Add user message to history
    conversation_history.append({"role": "user", "content": user_text})
    
    # Prepare messages: system prompt + full history
    messages = [{"role": "system", "content": system_prompt}] + conversation_history

    # Call LLM with streaming (low latency)
    start_time = time.time()
    completion = groq_client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=messages,
        temperature=1,
        max_completion_tokens=2048,  # Optimized for faster responses
        top_p=1,
        stream=True,
    )

    full_reply = ""
    for chunk in completion:
        delta_content = chunk.choices[0].delta.content
        if delta_content:
            full_reply += delta_content

    elapsed = time.time() - start_time
    print(f"   ⚡ LLM response time: {elapsed:.2f}s")

    # Add assistant response to history
    conversation_history.append({"role": "assistant", "content": full_reply})

    # Parse the structured response
    data = parse_response(full_reply)
    tts_message = data.get("tts_message", full_reply)
    cart_status = data.get("cart_status", "shopping")
    order_data = data.get("order_data", [])

    # Display response details
    print("\n" + "-" * 60)
    print("  🧠 THOUGHT  :", data.get("thought_process", "-"))
    print("  🗣️  SPEAK    :", tts_message[:100] + ("..." if len(tts_message) > 100 else ""))
    print(f"  📍 STAGE    : {data.get('conversation_stage', '-')}  |  TONE: {data.get('ai_tone', '-')}")
    
    ca = data.get("customer_analysis", {})
    print(f"  😊 MOOD     : {ca.get('sentiment', '-')}  |  RUSH: {ca.get('urgency', '-')}")
    
    if order_data:
        items_str = ", ".join(f"{i.get('item_code')} x{i.get('qty')}" for i in order_data)
        print(f"  🛒 CART     : {items_str}")
    
    print(f"  ✅ STATUS   : {data.get('cart_status', '-')}")
    print("-" * 60)

    return tts_message, cart_status, order_data, data

# ─────────────────────────────────────────────────────────────────
# STEP 3 — TTS: AI reply → speech  (Sarvam with low-latency playback)
# ─────────────────────────────────────────────────────────────────
def speak(text, filename="output.mp3"):
    """Convert text to speech and play immediately."""
    print("🔊 Converting to speech...")
    
    start_time = time.time()
    headers = {
        "api-subscription-key": SARVAM_KEY,
        "Content-Type": "application/json",
    }
    payload = {
        "text": text,
        "target_language_code": "en-IN",
        "speaker": "anushka",  # Use anushka for warm voice
        "model": "bulbul:v2",
        "pace": 1.0,
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

    elapsed = time.time() - start_time
    print(f"   ⚡ TTS generation time: {elapsed:.2f}s")
    print(f"   ✓ Audio ready: {filename}")

    # Play audio based on OS (blocking call)
    if sys.platform == "darwin":
        os.system(f"afplay {filename}")
    elif sys.platform == "win32":
        # Windows: use default player (silent mode for minimal latency)
        os.system(f"start /wait {filename}")
    else:
        # Linux: mpg123 for quick playback
        os.system(f"mpg123 -q {filename} 2>/dev/null || ffplay -nodisp -autoexit {filename}")

# ─────────────────────────────────────────────────────────────────
# MAIN PIPELINE (Multi-turn voice ordering)
# ─────────────────────────────────────────────────────────────────
def run_pipeline():
    """Multi-turn voice ordering: listen → LLM → speak → repeat until order closed"""
    print("\n" + "=" * 60)
    print("  Mudigonda Sharma Cafe — Voice Ordering Pipeline")
    print("  Live STT → LLM → TTS with minimal latency")
    print("=" * 60)

    conversation_history.clear()
    system_prompt = build_prompt()

    while True:
        # Step 1: Record customer speech
        audio_file = record_audio()
        transcript = transcribe_audio(audio_file)

        if not transcript.strip():
            print("❌ Could not understand. Please try again.\n")
            continue

        print(f"✓ Recognized: '{transcript}'\n")

        # Step 2: Process with LLM + Step 3: Convert to speech
        tts_message, cart_status, order_data, full_data = get_llm_response(transcript, system_prompt)
        
        # Step 4: Play audio response
        speak(tts_message)

        # Check if order is complete
        if cart_status == "closed":
            print("\n" + "=" * 60)
            print("  ✅ ORDER CONFIRMED & CLOSED!")
            print("=" * 60)
            print(f"Order ID: {full_data.get('order_id', 'N/A')}")
            print(f"Items: {json.dumps(order_data, indent=2, ensure_ascii=False)}")
            print(f"Total: Rs.{full_data.get('order_total', 0)}")
            print("=" * 60 + "\n")
            break

if __name__ == "__main__":
    run_pipeline()
