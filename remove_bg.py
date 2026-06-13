from PIL import Image

def remove_black_background(input_path, output_path, threshold=30):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    new_data = []
    for item in datas:
        # item is (R, G, B, A)
        # If the pixel is close to black (all RGB values below threshold), make it transparent
        if item[0] < threshold and item[1] < threshold and item[2] < threshold:
            new_data.append((0, 0, 0, 0)) # Fully transparent
        else:
            # Optionally, we can blend it, but for now just keep the colored pixels
            new_data.append(item)

    img.putdata(new_data)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    remove_black_background(
        "C:\\Users\\WINDOWS\\OneDrive\\Desktop\\develop\\static\\images\\logo.jpg",
        "C:\\Users\\WINDOWS\\OneDrive\\Desktop\\develop\\static\\images\\logo_transparent.png"
    )
