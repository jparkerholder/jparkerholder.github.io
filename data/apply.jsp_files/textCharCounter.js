/**
 * Ensures that field doesn't contain more characters then maxlimit
 * 
 * @param field - id of a TextField or TextArea
 * @param cntfield - id of a Counter Field
 * @param maxlimit - Max number of characters that field may contain
 */
function textCounter(field, cntfield, maxlimit) {
    if (field.value.length > maxlimit) {
        field.value = field.value.substring(0, maxlimit);
    }
    cntfield.value = maxlimit - field.value.length;
}
