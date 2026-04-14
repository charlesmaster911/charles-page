var SHEET_ID = "1TEBuJCi6ATs-Dlt8H2LwXQVHJTfbc7PFSPH5EJMGTOo";
var INBOX_FOLDER_ID = "1joXbeZHb-nA5O75z7JKfKgp7h43gkzKh";
var PROCESSED_FOLDER = "sb-processed";

function processThoughts() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName("단상");
  if (!sheet) {
    sheet = ss.insertSheet("단상");
    sheet.appendRow(["date", "title_ko", "title_en", "ko", "en"]);
  }

  var inbox = DriveApp.getFolderById(INBOX_FOLDER_ID);

  var processedList = DriveApp.getFoldersByName(PROCESSED_FOLDER);
  var processed = processedList.hasNext() ? processedList.next() : DriveApp.createFolder(PROCESSED_FOLDER);

  var files = inbox.getFilesByType(MimeType.GOOGLE_DOCS);
  var count = 0;

  while (files.hasNext()) {
    var file = files.next();
    var nameNoSpace = file.getName().replace(/\s+/g, "");
    if (nameNoSpace.indexOf("찰스단상") === -1) continue;

    try {
      var doc = DocumentApp.openById(file.getId());
      var text = doc.getBody().getText().trim();
      var lines = text.split("\n").map(function(l) { return l.trim(); }).filter(function(l) { return l; });
      if (lines.length === 0) continue;

      var titleKo = lines[0];
      var bodyKo = lines.slice(1).join("\n").trim();
      var date = Utilities.formatDate(file.getDateCreated(), "Asia/Seoul", "yyyy.MM.dd");

      sheet.appendRow([date, titleKo, "", bodyKo, ""]);
      file.moveTo(processed);
      count++;
      Logger.log("저장: " + titleKo);
    } catch (err) {
      Logger.log("오류: " + file.getName() + " - " + err);
    }
  }

  Logger.log("처리 완료: " + count + "개");
}

function installTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === "processThoughts") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("processThoughts").timeBased().everyHours(1).create();
  Logger.log("트리거 설치 완료");
}

function doGet(e) {
  try {
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var action = e && e.parameter ? e.parameter.action : "";
    var type = e && e.parameter ? e.parameter.type : "";

    if (action === "getThoughts") {
      var sheet = ss.getSheetByName("단상");
      if (!sheet) return json([]);
      var data = sheet.getDataRange().getValues();
      var thoughts = [];
      for (var i = 1; i < data.length; i++) {
        if (!data[i][0]) continue;
        thoughts.push({
          date: String(data[i][0]),
          title_ko: data[i][1] || "",
          title_en: data[i][2] || "",
          ko: data[i][3] || "",
          en: data[i][4] || ""
        });
      }
      thoughts.reverse();
      return json(thoughts);
    }

    if (type === "thought") {
      var tSheet = ss.getSheetByName("단상") || ss.insertSheet("단상");
      if (tSheet.getLastRow() === 0) tSheet.appendRow(["date","title_ko","title_en","ko","en"]);
      tSheet.appendRow([e.parameter.date, e.parameter.title_ko, e.parameter.title_en, e.parameter.body_ko, e.parameter.body_en]);
      return ContentService.createTextOutput("ok");
    }

    return ContentService.createTextOutput("ok");
  } catch(err) {
    return ContentService.createTextOutput("ERROR: " + err.toString());
  }
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function debugInbox() {
  var inbox = DriveApp.getFolderById(INBOX_FOLDER_ID);
  var files = inbox.getFiles();
  while (files.hasNext()) {
    var f = files.next();
    Logger.log("파일명: " + f.getName() + " | 타입: " + f.getMimeType());
  }
}
