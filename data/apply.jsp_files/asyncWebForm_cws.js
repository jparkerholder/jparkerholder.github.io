function getWebFormHTML(webFormRequest, callbackFunction, modifyBean) {
    DWRFacade.getWFHTML(webFormRequest, modifyBean, {
        callback: function(str) {
            callbackFunction(str);
        },
        timeout:0,  // timeout of 0 (disabled) needed as DWR has timeout bug when scripttag method used
        errorHandler:function(message) {
            callbackFunction("Error retrieving page HTML:<br>" + message);
        }
    });
}

function loadWebFormHTML(id, webFormRequest, modifyBean) {
    DWRFacade.getWFHTML(webFormRequest, modifyBean, {
        callback: function(str) {
            setElementContent(id, str);
            // Run all new javascript that may have came in
            evalElementScripts(id);

            // convert pngs to gif for IE6
            if (typeof fnLoadPngs == 'function') {
                fnLoadPngs();
            }
        },
        timeout:0,   // timeout of 0 (disabled) needed as DWR has timeout bug when scripttag method used
        errorHandler:function(message) {
            setElementContent(id, "Error retrieving page HTML:<br>" + message);
        }
    });
}

function WebFormRequestModifyBean(subFormIndex, initTabIndex, seqNo) {
    this.subFI = subFormIndex;
    this.initTI = initTabIndex;
    this.s = seqNo;
}