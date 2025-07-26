export function publishVisualToSheets(visualDescriptions: any): void {
  fetch("/api/publish-visual-sheets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visualDescriptions }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to publish visuals to Google Sheets");
      return res.json();
    })
    .then(() => {
      alert("Visual descriptions sent to Google Sheets!");
    })
    .catch((err) => {
      alert("Error sending to Google Sheets: " + err.message);
    });
}