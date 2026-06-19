# Adding Videos to the App

## What you edit
You only edit 	utorials.ts.

## Before you start
Make sure the YouTube video allows embedding.

## Steps to add a video
1. Open 	utorials.ts.
2. Find the 	utorials array.
3. Copy one tutorial object.
4. Change the id.
5. Change the 	itle.
6. Change the description.
7. Replace embedUrl with the new YouTube embed link.
8. Save the file.
9. Rebuild or reload the app.

## Correct embed URL
Use this format:

https://www.youtube.com/embed/VIDEO_ID

If you want privacy-enhanced mode, use:

https://www.youtube-nocookie.com/embed/VIDEO_ID

## Example
`	s
{
  id: "new-tutorial",
  title: "My New Video",
  description: "A short explanation of the video.",
  embedUrl: "https://www.youtube.com/embed/ABC123XYZ",
}
`

## Rules
- Every id must be unique.
- Keep titles short.
- Keep descriptions clear.
- Test after adding each video.
- If the video does not play, check that embedding is enabled on YouTube.

## What not to do
- Do not paste a normal watch link unless your code converts it.
- Do not reuse an existing id.
- Do not use a video that blocks embedding.

## Simple workflow
1. Add video in 	utorials.ts.
2. Save.
3. Reload app.
4. Confirm it appears in the tutorials screen.
