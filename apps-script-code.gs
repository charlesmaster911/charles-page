function doGet(e) {
  var ss = SpreadsheetApp.openById("1AdvrPYyYQVqIgUE-R0bLMYyg_HGIjL8P_9vHugOtykw");

  if (e.parameter.action === "getThoughts") {
    var sheet = ss.getSheetByName("단상");
    if (!sheet) return ContentService.createTextOutput("[]").setMimeType(ContentService.MimeType.JSON);
    var data = sheet.getDataRange().getValues();
    var thoughts = [];
    for (var i = 1; i < data.length; i++) {
      if (data[i][0]) {
        thoughts.push({
          date: data[i][0],
          title_ko: data[i][1],
          title_en: data[i][2],
          ko: data[i][3],
          en: data[i][4]
        });
      }
    }
    return ContentService.createTextOutput(JSON.stringify(thoughts)).setMimeType(ContentService.MimeType.JSON);
  }

  var sheet = ss.getActiveSheet();
  if (e.parameter.type === "thought") {
    var thoughtSheet = ss.getSheetByName("단상") || ss.insertSheet("단상");
    if (thoughtSheet.getLastRow() === 0) {
      thoughtSheet.appendRow(["date", "title_ko", "title_en", "ko", "en"]);
    }
    thoughtSheet.appendRow([
      e.parameter.date,
      e.parameter.title_ko,
      e.parameter.title_en,
      e.parameter.body_ko,
      e.parameter.body_en
    ]);
  } else {
    sheet.appendRow([e.parameter.date, e.parameter.name, e.parameter.email, e.parameter.type]);
  }
  return ContentService.createTextOutput("ok");
}
