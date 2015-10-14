(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function get_signed_request_to_AWS(file) {
	//first, we generate the signed URL for the video. The upload comes next, with a PUT request
	var xhr = new XMLHttpRequest()
	xhr.open("GET", "/sign_s3?file_name="+file.name+"&file_type="+file.type);
	xhr.onreadystatechange = function(){
		if(xhr.readyState == 4) {
			if(xhr.status == 200) {
				var response = JSON.parse(xhr.responseText)
				console.log(response)
				upload_video_file(file, response)
			}
			else {
				alert('Something went wrong when signing the file to AWS')
			}
		}
	}
	xhr.send()
}
function upload_video_file(file,response) {
	console.log("Uploading File... May take a while.")
	$(document).ready(
		function(){
			$('#status').text("Uploading file. Please wait.")
		}
	)
	var xhr = new XMLHttpRequest()
	xhr.open("PUT", response.signed_request)
	xhr.upload.onprogress = function(e){
		$(document).ready(
			function(){
				var percentage = ((e.loaded/e.total)*100).toFixed(2)
				$('#percentage').text(percentage + "%")
			}
		)
	}
	console.log(response.signed_request)
	xhr.setRequestHeader('x-amz-acl', 'public-read')
	xhr.onload = function(){
		//everything is a-ok!
		if(xhr.status == 200){
			$(document).ready(
				function(){
					$('#status').text("File Uploaded. Wait for transcoding to end")
					console.log(xhr.responseText)
				});
			$.ajax({
				datatype: "json",
				type: 'POST',
				url: "/transcode",
				data: response,
				success: function(response){
					var resp = JSON.parse(response)
					console.log("resulted url:" + resp.url)
					var encoded = encodeURIComponent(resp.url)
					console.log("encoded URL: " + encoded)
					window.location = '/play?url='+encoded
				}
			});
		}
		else{
			alert("Something went wrong while uploading the file. Try again?\nErr=" + xhr.status)
		}
	}
	xhr.send(file)
}
function initiate_upload() {
	var files = document.getElementById('file_input').files;
	var file = files[0]
	console.log(file.type.split('/')[0])
	if (file==null){
		alert("No file was selected")
		return;
	}
	if (file.type.split('/')[0]!="video"){
		alert("file must be a video")
		return;
	}
	//Try to upload the file to AWS, assyncronous.
	get_signed_request_to_AWS(file)
}


(function() {
	var filepicker = document.getElementById('file_input');
	filepicker.onchange = initiate_upload;
	})();
},{}]},{},[1]);
