// constructor for object that represents 1 form holder
function RlentData(maxNumberOfEntites, minNumberOfEntities, seqNo, currentNumberOfEntities, addAnotherSectionId, lastColumnId, confirmationMessage, deleteButtonText, initTabIndex, formParams, colspan, webFormRequest, renderedEntitiesStack, deleteSectionId) {
    // initial sequence number (used for marking order of rolling entities). On adding new form seqNo is incremented
    this.seqNo = seqNo;
    // initial tab index for this form (incremented on adding a new form)
    this.initTabIndex = initTabIndex;
    // WebFormRequest string. It contains all parameters for fetching a new form.
    this.webFormRequest = webFormRequest;
    // colspan of current rendering
    this.colspan = colspan;
    // params for all forms that can be added
    this.formParams = formParams;
    // id of the column that stands above the add another button and below the last form (used as a placeholder for adding new forms)
    this.lastColumnId = lastColumnId;
    this.addAnotherSectionId = addAnotherSectionId;
    this.deleteSectionId = deleteSectionId;
    // minimum number of entities
    this.minNumberOfEntities = minNumberOfEntities;
    // max number of forms that can be added
    this.maxNumberOfEntities = maxNumberOfEntites;
    // rendered entiites stack
    this.renderedEntitiesStack = renderedEntitiesStack;
    // current number of forms that are rendered
    this.currentNumberOfEntities = currentNumberOfEntities;
    // form is currently beeing added. (needed for delete higlighting)
    this.addingForm = false;

    // messages
    this.confirmationMessage = confirmationMessage;
    this.deleteButtonText = deleteButtonText;

    // methods
    this.setContent = setContent;
    this.addRollEntity = addRollEntity;
    this.deleteRollingEntity = deleteRollingEntity;
    this.markFormAsAltered = markFormAsAltered;
    this.initDeleteEvents = initDeleteEvents;

    // initialization code
    // attach delete button events on page load
    var thisObj = this;
    addEventSimple(window, "load", function() {
        thisObj.initDeleteEvents();
    });
}

// constructor for form params (parameters
function RlentFormParams(id, subFormIndex, used) {
    this.id = id;
    this.subFormIndex = subFormIndex;
    this.used = used;
}

// adds another form if there maximum number is not exceeded
function addRollEntity() {
    var seq = 0;
    for (var key in this.formParams) {
        seq = seq + 1;
        if (!this.formParams[key].used) {
            this.formParams[key].used = true;
            this.currentNumberOfEntities ++;
            var thisObj = this;
            getWebFormHTML(this.webFormRequest, function(str) {
                thisObj.setContent(str, thisObj.formParams[key].subFormIndex);
            }, new WebFormRequestModifyBean(this.formParams[key].subFormIndex, this.initTabIndex + 1, seq));
            this.addingForm = true;
            // hide the add another button if the max entity number is exceeded
            if (this.currentNumberOfEntities >= this.maxNumberOfEntities) {
                $('#' + this.addAnotherSectionId).hide();
            }
            break;
        }
    }
}

// called back from DWR to insert the fetched form and insert a delete button
function setContent(content, index) {
    var id = this.formParams[index].id
    var row = "<tr id=\"" + id + "_table\"><td id=\"" + id + "_table_td\" colspan=\"" + this.colspan + "\">";
    row += content;
    row += "</td></tr>";
    $('#' + this.lastColumnId).before(row);
    var obj = this;
    attachInputOnChangeEvents(id + "_table", function() {
        obj.markFormAsAltered(index, obj.seqNo);
    });
    this.initTabIndex += 100;

    // add presence input
    var input = document.createElement("input");
    input.setAttribute("type", "hidden");
    input.setAttribute("name", "sub_form_pres_" + index);
    input.setAttribute("value", "" + this.seqNo);
    input.setAttribute("id", "id_sub_form_pres_" + index);
    document.getElementById(id + "_table").appendChild(input);
    // focus on the first field
    focusOnFirstInput(id + "_table");
    this.seqNo++;
    this.renderedEntitiesStack.push(index);

    // unhide delete button
    if (this.currentNumberOfEntities > this.minNumberOfEntities) {
        $('#' + this.deleteSectionId).show();
    }
    this.addingForm = false;
}

// deletes last entity table, unhides the add another button. Updates the rolling entity data structure.
function deleteRollingEntity(embeddedPageType) {
    if (confirm(this.confirmationMessage)) {
        var formIndex = this.renderedEntitiesStack.pop();;
        var formParams = this.formParams[formIndex];
        var id = formParams.id;
        var thisObj = this;
        setTimeout(function() {
            delayedDelete(id, thisObj.addAnotherSectionId, thisObj.currentNumberOfEntities, thisObj.maxNumberOfEntities);
        }, 1500);

        // remove form presnece markers
        safeRemoveElement("id_sub_form_seq_" + formIndex);
        safeRemoveElement("id_sub_form_pres_" + formIndex);

        highlightTableDeletion(id + '_table_td');

        // update form holder status
        this.currentNumberOfEntities--;
        formParams.used = false;
        formParams.altered = false;

        if (this.currentNumberOfEntities <= this.minNumberOfEntities) {
            $('#' + this.deleteSectionId).hide();
        }

        var rollingEntityId = $("#rollingEntityId" + formIndex).val();
        if (rollingEntityId === undefined || rollingEntityId == null) {
            return;
        }
        var oldValue = $("#" + embeddedPageType + "\\.removedIds").val();

        $("#" + embeddedPageType + '\\.removedIds').val(oldValue.length > 0 ? oldValue + "," + rollingEntityId : rollingEntityId);
    }
}
// does the DOM delete of table. deletes all elements that need to be deleted on delay.
function delayedDelete(id, buttonId, currentNumberOfEntities, maxNumberOfEntities) {
    $('#' + id + '_table').remove();
    // hide the add another button if the max entity number is exceeded
    if (currentNumberOfEntities <= maxNumberOfEntities) {
        $('#' + buttonId).show();
    }
}

// updates input for special to present dates
function dateModified(yearId, monthId, inputName) {
    var yearSelect = document.getElementById(yearId);
    var monthSelect = document.getElementById(monthId);

    var input = document.getElementsByName(inputName)[0];
    if (monthSelect.value != "" && yearSelect.value != "") {
        input.value = monthSelect.value + "/" + yearSelect.value;
    } else {
        input.value = "";
    }

    // disable month select if year select is till present day
    monthSelect.disabled = (yearSelect.value == "9000");
    if (yearSelect.value == "9000") {
        input.value = "1/9000";
    }
}

// updates input for special to present dates
function dateModifiedV2(yearId, monthId, inputName, element) {
    var parentElement = $(element).parent();
    var yearSelect = parentElement.find('[id*=' + yearId + ']');
    var monthSelect = parentElement.find('[id*=' + monthId + ']');

    var input = parentElement.siblings('input[name*=' + inputName + ']');
    if (monthSelect.val() != "" && yearSelect.val() != "") {
        input.val(monthSelect.val() + "/" + yearSelect.val());
    } else {
        input.val("");
    }

    // disable month select if year select is till present day
    if (yearSelect.val() == "9000") {
        monthSelect.attr("disabled", "disabled");
        input.val("1/9000");
    } else {
        monthSelect.removeAttr("disabled");
    }
}

// higlights whole table
function highlightTableDeletion(id) {
    var element = document.getElementById(id);
    element.style.opacity = 0.5;
    element.style.filter = 'alpha(opacity=' + 50 + ')';
    $('#' + id).css({
        'border': '1px dotted #333'
    });
}

// removes higlight effect from a table.
function removehighlightTable(id) {
    var element = document.getElementById(id);
    element.style.opacity = 1;
    element.style.filter = 'alpha(opacity=' + 100 + ')';
    $('#' + id).css({
        'border': ''
    });
}

// adds UI effects to the delete button.
function initDeleteEvents() {
    var deleteButton = document.getElementById(this.deleteSectionId + '_div');
    var thisObj = this;
    var mouseOverEvent = function() {
        if (!thisObj.addingForm && thisObj.renderedEntitiesStack.length > thisObj.minNumberOfEntities) {
            var id = thisObj.formParams[thisObj.renderedEntitiesStack[thisObj.renderedEntitiesStack.length - 1]].id;
            highlightTableDeletion(id + '_table_td');
        }
    };
    var mouseOutEvent = function() {
        if (thisObj.renderedEntitiesStack.length > thisObj.minNumberOfEntities) {
            var id = thisObj.formParams[thisObj.renderedEntitiesStack[thisObj.renderedEntitiesStack.length - 1]].id;
            removehighlightTable(id + '_table_td');
        }
    };

    addEventSimple(deleteButton, 'mouseover', mouseOverEvent);
    addEventSimple(deleteButton, 'mouseout', mouseOutEvent);
}

// add event to from element safely. (copied here as cws does not have mentalmodels access).
function addEventSimple(obj, evt, fn) {
    if (obj.addEventListener) {
        obj.addEventListener(evt, fn, false);
    } else
        if (obj.attachEvent) {
            obj.attachEvent('on' + evt, fn);
        }
}
// removes event from element safely. (copied here as cws does not have mentalmodels access)
function removeEventSimple(obj, evt, fn) {
    if (obj.removeEventListener) {
        obj.removeEventListener(evt, fn, false);
    } else
        if (obj.detachEvent) {
            obj.detachEvent('on' + evt, fn);
        }
}

// attaches on change for marking form as altered (required).
function attachInputOnChangeEvents(id, func) {
    var element = document.getElementById(id);
    // set on change for all input elements
    var inputs = element.getElementsByTagName("input");
    attachOnChangeEvent(inputs, func);
    // set on change event for all select elements
    inputs = element.getElementsByTagName("select");
    attachOnChangeEvent(inputs, func);
    // set on change for text areas
    inputs = element.getElementsByTagName("textarea");
    attachOnChangeEvent(inputs, func);
}
// attach on change events to all inputs in the form
function attachOnChangeEvent(inputs, func) {
    for (var i = 0; i < inputs.length; i++) {
        addEventSimple(inputs[i], "change", func);
    }
}

// adds an input that marks the form as altered. This means that the form is validated.
function markFormAsAltered(index, seqNo) {
    var params = this.formParams[index];
    if (!params.altered) {
        var input = document.createElement("input");
        input.setAttribute("type", "hidden");
        input.setAttribute("name", "sub_form_seq_" + index);
        input.setAttribute("value", "" + seqNo);
        input.setAttribute("id", "id_sub_form_seq_" + index)
        document.getElementById(params.id + "_table").appendChild(input);
    }
    params.altered = true;
}

// safely remove element. No errors if id is not present.
function safeRemoveElement(id) {
    var element = document.getElementById(id);
    if (element) {
        $('#' + id).remove();
    }
}

// focuses on the first element of the newly added form
function focusOnFirstInput(id) {
    var element = document.getElementById(id);
    if (element) {
        //noinspection JSUnusedLocalSymbols
        try {
            var elements = $('#' + id + ' [tabindex]').get();
            elements.sort(function(a, b) {
                // if elements do not have tab index move them to the end of array.
                var aTabIndex = a.getAttribute('tabindex');
                var bTabIndex = b.getAttribute('tabindex');
                if (!aTabIndex) {
                    return 1;
                }
                if (!bTabIndex) {
                    return -1;
                }

//              order ascending by tab index.
                return aTabIndex - bTabIndex;
            });
            if (elements.length > 0) {
                // iterate through elements and focus on first one that has the focus function.
                for (var i = 0; i < elements.length; i++) {
                    if (elements[i].focus) {
                        $(elements[i]).focus();
                        break;
                    }
                }
            }
        } catch(e) {
            // error prevention (close to release). Focus will stay on add another.
        }
    }
}
