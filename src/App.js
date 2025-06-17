import React, { useState, useEffect, useCallback, useRef } from 'react';
import Editor from '@monaco-editor/react';
import './App.css'; // Keep the default CSS if you want, or remove if you're writing your own styles

// Define your templates (this block should be at the top of your file, after imports)
const TEMPLATES = {
  default: { // Your current default code
    html: `<!DOCTYPE html>
<html>
<head>
  <title>Live Preview</title>
</head>
<body>
  <h1>Hello from the Editor!</h1>
  <p>Start typing your HTML here.</p>
  <button id="myButton">Click Me</button>
</body>
</html>`,
    css: `body {
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  flex-direction: column;
}
h1 {
  text-align: center;
  font-size: 3em;
  color: green;
}
button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
}
button:hover {
  background-color: #0056b3;
}`,
    js: `console.log("Hello from JavaScript!");
document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('myButton');
  if (button) {
    button.addEventListener('click', () => {
      alert('Button clicked!');
    });
  }
});`
  },
  simpleCard: { // A new, simple card template
    html: `<!DOCTYPE html>
<html>
<head>
  <title>Simple Card</title>
</head>
<body>
  <div class="card">
    <h2>Card Title</h2>
    <p>This is a simple card created with HTML and CSS.</p>
    <button class="card-button">Learn More</button>
  </div>
</body>
</html>`,
    css: `body {
  font-family: sans-serif;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f4f4f4;
}
.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 300px;
  text-align: center;
}
.card h2 {
  color: #333;
}
.card p {
  color: #666;
  font-size: 0.9em;
  line-height: 1.5;
}
.card-button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 15px;
}
.card-button:hover {
  background-color: #45a049;
}`,
    js: `console.log("Card loaded!");
document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('.card-button');
  if (button) {
    button.addEventListener('click', () => {
      alert('Card button clicked!');
    });
  }
});`
  },
  flexboxExample: {
    html: `<!DOCTYPE html>
<html>
<head>
  <title>Flexbox Layout</title>
</head>
<body>
  <div class="flex-container">
    <div class="flex-item">Item 1</div>
    <div class="flex-item">Item 2</div>
    <div class="flex-item">Item 3</div>
  </div>
</body>
</html>`,
    css: `body {
  font-family: sans-serif;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #eee;
}
.flex-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.flex-item {
  background-color: #007bff;
  color: white;
  padding: 20px;
  border-radius: 5px;
  flex: 1; /* Allows items to grow and shrink */
  min-width: 100px;
  text-align: center;
}
`,
    js: `console.log("Flexbox example loaded.");`
  }
};


function App() {
  // State for HTML code - Initialized from TEMPLATES.default
  const [htmlCode, setHtmlCode] = useState(TEMPLATES.default.html);

  // State for CSS code - Initialized from TEMPLATES.default
  const [cssCode, setCssCode] = useState(TEMPLATES.default.css);

  // State for JavaScript code - Initialized from TEMPLATES.default
  const [jsCode, setJsCode] = useState(TEMPLATES.default.js);

  // State to hold the combined source for the iframe
  const [srcDoc, setSrcDoc] = useState('');

  // Ref for the hidden input field to copy URL
  const shareUrlRef = useRef(null);

  // useEffect to update srcDoc whenever HTML, CSS, or JS code changes
  useEffect(() => {
    const fullSrcDoc = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>${cssCode}</style>
      </head>
      <body>
        ${htmlCode}
        <script>${jsCode}</script>
      </body>
      </html>
    `;
    setSrcDoc(fullSrcDoc);
  }, [htmlCode, cssCode, jsCode]); // Depend on all three code states

  // useEffect to read code from URL on initial load
  // This effect runs once on mount. It prioritizes URL content IF it exists.
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlHtml = urlParams.get('html');
    const urlCss = urlParams.get('css');
    const urlJs = urlParams.get('js');

    if (urlHtml || urlCss || urlJs) { // Only attempt to decode if any URL param exists
      try {
        if (urlHtml) setHtmlCode(atob(decodeURIComponent(urlHtml)));
        if (urlCss) setCssCode(atob(decodeURIComponent(urlCss)));
        if (urlJs) setJsCode(atob(decodeURIComponent(urlJs)));
      } catch (e) {
        console.error("Failed to decode code from URL", e);
        // Fallback to default template if decoding from URL fails
        setHtmlCode(TEMPLATES.default.html);
        setCssCode(TEMPLATES.default.css);
        setJsCode(TEMPLATES.default.js);
      }
    }
  }, []); // Empty dependency array means this runs once on component mount


  // Function to generate a shareable URL
  const generateShareUrl = useCallback(() => {
    const encodedHtml = encodeURIComponent(btoa(htmlCode));
    const encodedCss = encodeURIComponent(btoa(cssCode));
    const encodedJs = encodeURIComponent(btoa(jsCode));

    // Construct the URL with query parameters
    const url = `${window.location.origin}/?html=${encodedHtml}&css=${encodedCss}&js=${encodedJs}`;
    return url;
  }, [htmlCode, cssCode, jsCode]);

  // Function to load a template
  const loadTemplate = useCallback((templateName) => {
    if (templateName === "") return; // Don't do anything if "Select" is chosen
    const template = TEMPLATES[templateName];
    if (template) {
      if (window.confirm("Loading a template will overwrite your current code. Are you sure?")) {
        setHtmlCode(template.html);
        setCssCode(template.css);
        setJsCode(template.js);
      }
    } else {
      console.warn(`Template "${templateName}" not found.`);
    }
  }, [setHtmlCode, setCssCode, setJsCode]); // Dependencies for useCallback


  return (
    <div className="App" style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Editor Section */}
      <div style={{ flex: 1, borderRight: '1px solid #333', background: '#1e1e1e', color: '#ccc', display: 'flex', flexDirection: 'column' }}>
        {/* Template Selector UI */}
        <div style={{ textAlign: 'center', margin: '10px 0', flexShrink: 0 }}>
          <label htmlFor="template-select" style={{ color: '#ccc', marginRight: '10px' }}>Load Template:</label>
          <select
            id="template-select"
            onChange={(e) => loadTemplate(e.target.value)}
            style={{
              padding: '5px 10px',
              borderRadius: '5px',
              border: '1px solid #007acc',
              backgroundColor: '#333',
              color: '#fff',
              cursor: 'pointer'
            }}
            value="" // Ensure the select shows "-- Select --" initially
          >
            <option value="">-- Select --</option>
            {Object.keys(TEMPLATES).map(key => (
              <option key={key} value={key}>
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} {/* Formats "simpleCard" to "Simple Card" */}
              </option>
            ))}
          </select>
        </div>
        <h2 style={{ textAlign: 'center', margin: '10px 0', color: '#007acc', flexShrink: 0 }}>HTML Editor</h2>
        <Editor
          height="33%" // Adjusted height for 3 editors
          language="html"
          theme="vs-dark"
          value={htmlCode} // Use 'value' instead of 'defaultValue' for controlled component
          onChange={setHtmlCode}
          options={{
            minimap: { enabled: false },
            wordWrap: 'on',
            fontSize: 16,
          }}
        />
        <h2 style={{ textAlign: 'center', margin: '10px 0', color: '#007acc', flexShrink: 0 }}>CSS Editor</h2>
        <Editor
          height="33%" // Adjusted height for 3 editors
          language="css" // Language changed to css
          theme="vs-dark"
          value={cssCode} // Use 'value' instead of 'defaultValue' for controlled component
          onChange={setCssCode}
          options={{
            minimap: { enabled: false },
            wordWrap: 'on',
            fontSize: 16,
          }}
        />
        <h2 style={{ textAlign: 'center', margin: '10px 0', color: '#007acc', flexShrink: 0 }}>JavaScript Editor</h2>
        <Editor
          height="34%" // Remaining height (33 + 33 + 34 = 100)
          language="javascript" // Language changed to javascript
          theme="vs-dark"
          value={jsCode} // Use 'value' instead of 'defaultValue' for controlled component
          onChange={setJsCode}
          options={{
            minimap: { enabled: false },
            wordWrap: 'on',
            fontSize: 16,
          }}
        />
      </div>

      {/* Live Preview Section */}
      <div style={{ flex: 1 }}>
        <h2 style={{ textAlign: 'center', margin: '10px 0', color: '#555' }}>Live Preview</h2>
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <button
            onClick={() => {
              const url = generateShareUrl();
              if (shareUrlRef.current) {
                shareUrlRef.current.value = url;
                shareUrlRef.current.select();
                // Prefer modern Clipboard API if available
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  navigator.clipboard.writeText(url)
                    .then(() => alert('Share URL copied to clipboard! \n' + url))
                    .catch(() => alert('Failed to copy. Please copy manually: \n' + url));
                } else {
                  // Fallback for older browsers
                  document.execCommand('copy');
                  alert('Share URL copied to clipboard! \n' + url);
                }
              } else {
                alert('Share URL: \n' + url); // If ref is not ready
              }
            }}
            style={{
              padding: '8px 15px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '0.9em'
            }}
          >
            Share Code
          </button>
          <input
            ref={shareUrlRef}
            type="text"
            readOnly
            style={{ position: 'absolute', left: '-9999px' }}
          />
        </div>
        <iframe
          srcDoc={srcDoc}
          title="Live Preview"
          style={{ width: '100%', height: 'calc(100% - 90px)', border: 'none' }}
          sandbox="allow-scripts allow-forms allow-same-origin"
        ></iframe>
      </div>
    </div>
  );
}

export default App;