## **Smart Text Direction Extension**  

This extension is designed to **automatically change the text direction** in editable fields (such as input fields and text areas) on web pages, with the option for manual switching using keyboard shortcuts. For example, if the user types in Arabic or Hebrew (right-to-left languages), the extension will set the text direction to "rtl". If the text is in a left-to-right language (such as English), the direction will be set to "ltr".  

---

## **Extension Components**  

### **1. `manifest.json` File**  
This file contains the basic configuration and permissions for the extension.  

### **2. `content.js` File**  
This file includes the core functionality of the extension:  

- **Automatic text direction detection:** When the user types in an editable field, the extension analyzes the first character. If it belongs to an RTL language (such as Arabic or Hebrew), the text direction is set to "rtl"; otherwise, it is set to "ltr".  
- **Manual switching:** The user can manually change the text direction using keyboard shortcuts. Pressing **Control + Shift + Right Arrow** sets the direction to "rtl", while **Control + Shift + Left Arrow** sets it to "ltr".  
- **Alignment adjustment:** If text alignment is explicitly set to "right" or "left", it is reset to "start" to ensure consistency with the new text direction.  
- **Monitoring input events:** The extension listens to multiple events (`keydown`, `keyup`, `input`) to track text changes and shortcut usage.  

---

## **Code Functionality Explanation (For Non-Technical Users)**  

This extension helps users by **automatically adjusting text direction** based on the language they type. It also allows **manual switching** using simple keyboard shortcuts. Here’s how it works:  

### **1. Automatic Text Direction**  
- When you start typing in a text box (such as a search bar, comment box, or input field), the extension **detects the first letter**.  
- If the first letter is from a **right-to-left (RTL) language** (like Arabic or Hebrew), the text direction will be set to **right-to-left** automatically.  
- If the first letter is from a **left-to-right (LTR) language** (like English), the text will align from **left to right**.  
- This helps users type naturally without needing to adjust the text direction manually.  

### **2. Manual Text Direction Switching (Keyboard Shortcuts)**  
- If you ever need to change the text direction manually, you can use these shortcuts:  
  - **Press `Control + Shift + Right Arrow`** → Switch text to **right-to-left (RTL)**.  
  - **Press `Control + Shift + Left Arrow`** → Switch text to **left-to-right (LTR)**.  
- This is useful if you’re typing in mixed languages and want full control over text direction.  

### **3. Works Only in Editable Fields**  
- The extension applies these changes **only** in places where you can type, such as:  
  - **Search bars**  
  - **Comment sections**  
  - **Message boxes**  
  - **Text input fields**  
- It **does not affect** password fields or other non-editable areas.  

### **4. Prevents Unwanted Changes**  
- If you manually change the text direction, the extension **remembers your choice** and won’t override it.  
- It also checks the **overall page settings** to avoid interfering with websites that already have a specific text direction set.  

With this extension, you can type naturally in any language without worrying about adjusting the text direction manually. It saves time and ensures a smoother writing experience! 


---

## **Code Functionality Explanation (For Technical Users)**  

Below is a table summarizing each function in the code along with its purpose:

| **Function**                                 | **Purpose**                                                                                                                                                   |
|----------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `isRTL(char)`                                | Checks if the provided character belongs to a right-to-left language (e.g., Arabic, Hebrew) using a regular expression.                                        |
| `setDirection(element, dir, isManual=false)` | Sets the text direction of the specified element to either "rtl" or "ltr", adjusts text alignment to "start" if needed, and marks manual changes when applicable. |
| `isEditable(element)`                        | Determines whether the element is editable (e.g., an input field, textarea, or contentEditable element).                                                       |
| `shouldAutoChangeDirection(element)`         | Evaluates if the element is eligible for automatic text direction change based on its data attributes, page direction, and text alignment.                     |
| `getValue(element)`                          | Retrieves the text content or value from an element, depending on whether it is a contentEditable element or a standard input.                                |
| `handleKeydown(event)`                       | Tracks the keys pressed by the user during a keydown event to support the detection of shortcut sequences.                                                    |
| `handleKeyup(event)`                         | Processes the keyup event to validate the shortcut sequence and, if correct (Control + Shift with an arrow key), manually switches the text direction.    |
| `handleInput(event)`                         | Monitors input events on editable fields and automatically changes the text direction based on the first character entered.                                 |
| `handleFocus(event)`                         | Resets the tracking of pressed keys when focus changes, ensuring a fresh state for detecting keyboard shortcuts.                                             |

You can include this table within your README file to clearly document each function's role in the code.

---

## **Installation Steps**  

1. **Create the extension files:**  
   - Create a new folder on your computer (e.g., **`smart-text-direction`**).  
   - Inside the folder, create two files:  
     - **`manifest.json`** and paste the corresponding manifest content.  
     - **`content.js`** and paste the script provided above.  
   - Ensure you also have an **`icons`** folder containing icons in sizes **16×16**, **48×48**, and **128×128** pixels.
   - Or just download the code from the main repository page. and everything will be arranged to proceed to step 2 below.

2. **Open your Chrome-based browser such as Google Chrome, Microsoft Edge, etc.:**  
   - For the sake of this tutorial, we will explain things in Google Chrome browser.
   - Open the Chrome browser and type **`chrome://extensions`** in the address bar.  

3. **Enable Developer Mode:**  
   - Toggle **Developer Mode** from the switch at the top-right corner of the page.  

4. **Load the extension manually:**  
   - Click on **"Load Unpacked"**.  
   - Select the folder you created (**`smart-text-direction`**).  

5. **Verify installation:**  
   - Once loaded, the extension will appear in the Extensions page with its icon and name **"Smart Text Direction"**.  
   - Now, visit any website and try typing in an input field. The text direction should adjust automatically based on the first typed character, with the ability to switch manually using keyboard shortcuts.  

With this setup, the extension is ready to use, helping users seamlessly write in different languages without needing to manually adjust text direction settings.
