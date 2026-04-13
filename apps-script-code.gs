// ============================================================
// 찰스 단상 자동 수집 + 구독/멤버십 저장
// ============================================================
var SHEET_ID = "1AdvrPYyYQVqIgUE-R0bLMYyg_HGIjL8P_9vHugOtykw";
var INBOX_FOLDER = "sb-inbox";       // 글을 올리는 Drive 폴더명
var PROCESSED_FOLDER = "sb-processed"; // 처리 후 이동할 폴더명

// ---- 메인: 단상 자동 수집 (매시간 트리거) ----
function processThoughts() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName("단상");
  if (!sheet) {
    sheet = ss.insertSheet("단상");
    sheet.appendRow(["date", "title_ko", "title_en", "ko", "en"]);
  }

  // sb-inbox 폴더 찾기
  var inboxList = DriveApp.getFoldersByName(INBOX_FOLDER);
  if (!inboxList.hasNext()) {
    Logger.log("폴더를 찾을 수 없음: " + INBOX_FOLDER);
    return;
  }
  var inbox = inboxList.next();

  // 처리 완료 폴더 준비
  var processedList = DriveApp.getFoldersByName(PROCESSED_FOLDER);
  var processed = processedList.hasNext() ? processedList.next() : DriveApp.createFolder(PROCESSED_FOLDER);

  // Google Docs 파일 중 "찰스 단상" 포함 제목 찾기
  var files = inbox.getFilesByType(MimeType.GOOGLE_DOCS);
  var count = 0;

  while (files.hasNext()) {
    var file = files.next();
    if (file.getName().indexOf("찰스 단상") === -1) continue;

    try {
      var doc = DocumentApp.openById(file.getId());
      var text = doc.getBody().getText().trim();
      var lines = text.split("\n").map(function(l) { return l.trim(); }).filter(function(l) { return l; });

      if (lines.length === 0) continue;

      // 첫 줄 = 제목, 나머지 = 본문
      var titleKo = lines[0];
      var bodyKo = lines.slice(1).join("\n").trim();
      var date = Utilities.formatDate(file.getDateCreated(), "Asia/Seoul", "yyyy.MM.dd");

      sheet.appendRow([date, titleKo, "", bodyKo, ""]);
      file.moveTo(processed);
      count++;
      Logger.log("처리 완료: " + titleKo);
    } catch (err) {
      Logger.log("오류: " + file.getName() + " - " + err);
    }
  }

  Logger.log("총 " + count + "개 단상 처리 완료");
}

// ---- 트리거 설치 (한 번만 실행) ----
function installTrigger() {
  // 기존 트리거 제거
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === "processThoughts") {
      ScriptApp.deleteTrigger(t);
    }
  });
  // 매시간 트리거 설치
  ScriptApp.newTrigger("processThoughts")
    .timeBased()
    .everyHours(1)
    .create();
  Logger.log("트리거 설치 완료 - 매시간 자동 실행");
}

// ---- 웹앱 GET (사이트에서 단상 읽기 + 구독/멤버십 저장) ----
function doGet(e) {
  var ss = SpreadsheetApp.openById(SHEET_ID);

  // 단상 목록 반환
  if (e.parameter.action === "getThoughts") {
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
    // 최신순 정렬
    thoughts.reverse();
    return json(thoughts);
  }

  // 구독/멤버십/단상 저장
  var mainSheet = ss.getActiveSheet();
  if (e.parameter.type === "thought") {
    var tSheet = ss.getSheetByName("단상") || ss.insertSheet("단상");
    if (tSheet.getLastRow() === 0) tSheet.appendRow(["date","title_ko","title_en","ko","en"]);
    tSheet.appendRow([e.parameter.date, e.parameter.title_ko, e.parameter.title_en, e.parameter.body_ko, e.parameter.body_en]);
  } else {
    mainSheet.appendRow([e.parameter.date, e.parameter.name || "", e.parameter.email || "", e.parameter.type || ""]);
  }
  return ContentService.createTextOutput("ok");
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
