<?php
$db_server = 'localhost';
$db_username = 'test';
$db_password =  ''; //'Ravingongo12!';
$db_name = 'quizdb';
$conn=mysqli_connect($db_server,$db_username,$db_password,$db_name);

if($conn){
    echo "Connection Successful";
}
else{
    echo "could not connect!";
}
?>
 