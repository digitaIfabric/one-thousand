# one-thousand

ffmpeg command to batch convert aif to wav
for f in *.aiff; do ffmpeg -i "$f" -c:a pcm_s24le "${f%.aiff}.wav"; done
