function dailyUsersReport() {
  var pageToken, page;
  var lineCount = 1
  var reportSheet = SpreadsheetApp.create('tmp_dailyUsersReport')
  var range;

  do {
    page = AdminDirectory.Users.list({
      domain: 'example.org',
      orderBy: 'givenName',
      maxResults: 5000,
      pageToken: pageToken
    });
    var users = page.users;
    if (users) {
      for (var i = 0; i < users.length; i++) {
        var user = users[i];
        for (j = 0; j < user.emails.length; j++) {
          var em = user.emails[j]
          
          if (em.type == 'custom' && em.customType == '') {
            var range = reportSheet.getSheets()[0].getRange(lineCount, 1)
            reportSheet.setActiveRange(range)
            range.setValue(user.name.fullName)
            var range = reportSheet.getSheets()[0].getRange(lineCount, 2)
            reportSheet.setActiveRange(range)
            range.setValue(user.primaryEmail)
            var range = reportSheet.getSheets()[0].getRange(lineCount, 3)
            reportSheet.setActiveRange(range)
            range.setValue(em.address)
            
            lineCount++
          }
        }
      }
    } else {
    }
    pageToken = page.nextPageToken;
  } while (pageToken);

  SpreadsheetApp.flush()
  range = reportSheet.getSheets()[0].getRange(1,1,lineCount-1,4)
  var csvFile = convertRangeToCsvFile_('tmp_dailyUsersReport.csv', range);
  var newFile = DriveApp.createFile('tmp_dailyUsersReport.csv', csvFile);
  MailApp.sendEmail('email@example.org', 'Daily Google Apps User Report', '', {
    name: 'Google Apps',
    attachments: [newFile]
  });
  DriveApp.removeFile(newFile)
  var reportFile = DriveApp.getFileById(reportSheet.getId())
  DriveApp.removeFile(reportFile)
}

function convertRangeToCsvFile_(csvFileName, ws) {
  // Get the selected range in the spreadsheet
  try {
    var data = ws.getValues();
    var csvFile = undefined;

    // Loop through the data in the range and build a string with the CSV data
    if (data.length > 1) {
      var csv = "";
      for (var row = 0; row < data.length; row++) {
        for (var col = 0; col < data[row].length; col++) {
          if (data[row][col].toString().indexOf(",") != -1) {
            data[row][col] = "\"" + data[row][col] + "\"";
          }
        }

        // Join each row's columns
        // Add a carriage return to end of each row, except for the last one
        if (row < data.length-1) {
          csv += data[row].join(",") + "\r\n";
        }
        else {
          csv += data[row];
        }
      }
      csvFile = csv;
    }
    return csvFile;
  }
  catch(err) {
    Logger.log(err);
  }
}

