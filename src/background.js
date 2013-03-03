chrome.contextMenus.create({
	id: 'CurrencyConverter',
	title: '日本円に変換',
	contexts: [ 'selection' ]
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'http://www.google.com/ig/calculator?hl=ja&q=' + encodeURIComponent(info.selectionText) + '=?JPY');

	xhr.onreadystatechange = function() {

		if (xhr.readyState == 4) {

			if (!xhr.responseText) {
				executeScript(tab.id, generateError(info.selectionText));
			}

			var str = xhr.responseText.replace('lhs', '"lhs"').replace('rhs', '"rhs"').replace('icc', '"icc"').replace('error', '"error"');

			try {

				var data = JSON.parse(str);

				if (!data.lhs || !data.rhs) {
					throw new Error();
				}

				executeScript(tab.id, generateCode(data.lhs, data.rhs));

			} catch (e) {

				executeScript(tab.id, generateError(info.selectionText));
			}
		}
	};

	xhr.onerror = function() {
		executeScript(tab.id, generateError(info.selectionText));
	};

	xhr.send();
});

function generateCode(lhs, rhs) {
	return 'window.getSelection().getRangeAt(0).extractContents();' +
			'window.getSelection().getRangeAt(0).insertNode(document.createTextNode("' + rhs + '"));';
}

function generateError(lhs) {
	return 'window.getSelection().getRangeAt(0).extractContents();' +
			'window.getSelection().getRangeAt(0).insertNode(document.createTextNode("（変換に失敗しました）"));';
}

function executeScript(tabId, code) {
	chrome.tabs.executeScript(tabId, {
		code: code
	});
}