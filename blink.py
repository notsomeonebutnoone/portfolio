from PIL import Image
import os

# Load the base image
base_img = Image.open(r'C:\Users\Admin\Desktop\res\aweraf.jpg')
width, height = base_img.size

print(f"Image size: {width}x{height}")

# We'll create a smooth blinking/expression animation
# Frame sequence: eyes open -> half closed -> fully closed -> half closed -> open -> wink -> open

frames = []

# Get the base image pixels
base_pixels = base_img.load()

def create_frame_with_eyes(eye_state):
    """Create a frame with modified eye state
    eye_state: 'open', 'half', 'closed', 'wink_left', 'wink_right'
    """
    frame = base_img.copy()
    pixels = frame.load()
    
    # Define eye regions (approximate based on the image)
    # Left eye region (from image perspective)
    left_eye_x = range(380, 450)
    left_eye_y_top = range(505, 525)
    left_eye_y_bottom = range(545, 565)
    
    # Right eye region
    right_eye_x = range(280, 350)
    right_eye_y_top = range(505, 525)
    right_eye_y_bottom = range(545, 565)
    
    # Skin tone to use for closed eyes
    skin_color = (210, 157, 120)  # Approximate skin tone
    dark_skin = (180, 130, 100)  # For eyelid line
    
    if eye_state == 'closed':
        # Close both eyes
        for x in left_eye_x:
            for y in list(left_eye_y_top) + list(left_eye_y_bottom):
                if 0 <= x < width and 0 <= y < height:
                    pixels[x, y] = skin_color
        for x in right_eye_x:
            for y in list(right_eye_y_top) + list(right_eye_y_bottom):
                if 0 <= x < width and 0 <= y < height:
                    pixels[x, y] = skin_color
        # Add eyelid lines
        for x in left_eye_x:
            if 0 <= x < width and 530 < height:
                pixels[x, 530] = dark_skin
        for x in right_eye_x:
            if 0 <= x < width and 530 < height:
                pixels[x, 530] = dark_skin
                
    elif eye_state == 'half':
        # Half closed - cover bottom half
        for x in left_eye_x:
            for y in left_eye_y_bottom:
                if 0 <= x < width and 0 <= y < height:
                    pixels[x, y] = skin_color
        for x in right_eye_x:
            for y in right_eye_y_bottom:
                if 0 <= x < width and 0 <= y < height:
                    pixels[x, y] = skin_color
                    
    elif eye_state == 'wink_right':
        # Close right eye only
        for x in right_eye_x:
            for y in list(right_eye_y_top) + list(right_eye_y_bottom):
                if 0 <= x < width and 0 <= y < height:
                    pixels[x, y] = skin_color
        for x in right_eye_x:
            if 0 <= x < width and 530 < height:
                pixels[x, 530] = dark_skin
    
    return frame

# Create animation sequence
sequence = [
    ('open', 8),       # Hold open
    ('half', 2),       # Blink start
    ('closed', 3),     # Blink closed
    ('half', 2),       # Blink open
    ('open', 8),       # Hold open
    ('half', 2),       # Second blink
    ('closed', 3),     
    ('half', 2),
    ('open', 6),       # Hold
    ('wink_right', 4), # Wink
    ('open', 8),       # Hold open
]

for state, count in sequence:
    frame = create_frame_with_eyes(state)
    for _ in range(count):
        frames.append(frame.copy())

# Save as GIF
output_path = 'character_animation_smooth.gif'

frames[0].save(
    output_path,
    save_all=True,
    append_images=frames[1:],
    duration=100,  # 100ms per frame = 10fps
    loop=0
)

print(f"Smooth animation created!")
print(f"Total frames: {len(frames)}")
print(f"Duration: {len(frames) * 0.1} seconds")