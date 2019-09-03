
function fixEncoding(s) {
	/*for (var k=0; k<s.length; k++) {
		var ch = s.charCodeAt(k);
		//alert("char="+s.charAt(k)+" code="+ch);
		if (ch == 8216 || ch == 8217)
			s = s.substring(0, k)+"'"+s.substring(k+1);
		else if (ch == 8220 || ch == 8221)
			s = s.substring(0, k)+'"'+s.substring(k+1);
		else if (ch == 8226)
			s = s.substring(0, k)+'*'+s.substring(k+1);
		else if (ch == 8211)
			s = s.substring(0, k)+'-'+s.substring(k+1);
	}*/
	return s;
}

function encodeHtml(str){
    var div = document.createElement('div');
    var text = document.createTextNode(str);
    div.appendChild(text);
    return div.innerHTML;
}
