not a human

Run locally
  Requires Node.js 22 or newer. No package installation needed.
  From this directory, run: npm start
  Open http://127.0.0.1:4173
  Use PORT=4174 npm start if that port is occupied.

The dist directory is the complete static website. It can be uploaded to
any static website host. Fonts are bundled locally with their licenses.

Interaction
  Initially only an unchecked "I'm not a human" checkbox is shown.
  Click it to reveal a new 32 by 32 grid.
  Select all 73 squares with the exact color #7F807F within 60 seconds.
  Selection is a toggle. All matches and no extra squares are required.
  Success is automatic: the challenge closes and a green checked box
  remains. Timeout closes the challenge and returns an unchecked box
  with "Try again" underneath its label. Click it to start a fresh board;
  previous answers no longer apply.

Agent access
  Each tile's accessible button name includes its exact color, e.g.
  "Square 42, color #7F807F". Ordinary browser tools can inspect the
  page's accessible elements and click the 73 matching buttons one at
  a time. Browser-side code execution and a custom agent are unnecessary.
  The timer allows 60 seconds for inspection and sequential clicks.
  Tiles also expose data-color and data-index. There is no auto-solve
  control. Pure screenshot-only tools cannot reliably distinguish these
  almost identical colors; the browser tool must expose page elements.

Scope
  This is a playful, client-side automation challenge, not proof of AI
  identity. Browser scripts can pass and the client can be modified.
  Nothing is collected, stored, or sent to a server by the challenge.

Verification
  npm test
  Tests cover randomized boards, the exact match count, correct selection,
  extra selections, toggles, invalid inputs, and deadline enforcement.

Typography and visual reference
  https://www.yuvich.com/
  Instrument Sans and Fragment Mono, distributed under the SIL OFL.

Demo
  demo/success-1080-square-60fps.mp4
  Successful run: 1080 x 1080, 60 fps, 15.2 seconds.
