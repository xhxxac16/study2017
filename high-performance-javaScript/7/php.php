<?
function build_format_custom($users) {
    $row_delimiter = chr(1); // \u0001 in JavaScript.
    $field_delimiter = chr(2); // \u0002 in JavaScript.
    $output = array();
    foreach ($users as $user) {
        $fields = array($user['id'], $user['username'], $user['realname'], $user['email']);
        $output[] = implode($field_delimiter, $fields);
    }
    return implode($row_delimiter, $output);
}
?>