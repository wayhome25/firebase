// firebase 환경설정
var userInfo;
var database = firebase.database();
var provider = new firebase.auth.GoogleAuthProvider();


//로그인
firebase.auth().onAuthStateChanged(function(user){
  if (user){
    console.log('already login');
    userInfo = user; // 유저정보 저장
    get_list(); // 리스트 출력
  } else {
    firebase.auth().signInWithRedirect(provider).then(function(result){
    var user_uid= result.user.uid;
    var todoRef = database.ref('list/'+user_uid); // DB경로지정
    todoRef.push({
      description : "버튼을 눌러 새로운 할일을 추가해 보세요!",
      status : false
    });
    todoRef.push({
      description : "할일은 10자 이내로 입력 가능합니다",
      status : false
      });
    });

  }
});

//리스트 화면 출력
function get_list(){
  var todoRef = database.ref('list/'+userInfo.uid); // DB경로지정
  todoRef.on('child_added', on_child_added);
  function on_child_added(data){
    var key = data.key;
    var todoData = data.val();
    var txt = todoData.description;
    var status = todoData.status;
    // html 코드 내 이스케이프 문자 추가 필요
    var input_check;
    if(status === true){input_check = "<input type=\"checkbox\" class=\"filled-in\" id=\"check-box"+key+"\" checked/>"}else{input_check = "<input type=\"checkbox\" class=\"filled-in\" id=\"check-box"+key+"\" />"}
    var html = "<tr id='"+key+"'><td>"+input_check+
               "<label for=\"check-box"+key+"\">"+ txt +"</label>" +
               "<a onclick=\"delete_data('"+key+"')\"><i class=\"material-icons\">clear</i></a></td></tr>"
    $('tbody').prepend(html); //jQuery 자식요소 1번으로 추가
    $("#check-box"+key).change(function(){
      if(this.checked){
        todoRef = database.ref('list/'+userInfo.uid+'/'+key);
        todoRef.update({
          status :  true
        });
      }else{
        todoRef = database.ref('list/'+userInfo.uid+'/'+key);
        todoRef.update({
          status :  false
        });
      }
    });
  }
}


// 저장
$(function(){ // = $(document).ready(function() { ... });
    $(".input_to_do").keypress(function(e) { // 인풋창에서 엔터 입력시 저장함수 실행
      if(e.which == 13){
        save_data();
      }
    });
});

function save_data(){ // 입력한 데이터를 저장하고 화면에 출력
  var todoRef = database.ref('list/'+userInfo.uid); // DB경로지정
  var txt = $(".input_to_do").val(); // 입력값 txt 변수에 저장
  if (txt === ''){
    alert('내용을 입력해주세요.');
    return; // 함수종료
  }else if(txt.length > 20){
    alert('to-do list는 20자 이내로만 입력 가능합니다.');
    return; // 함수종료
  }else{
    todoRef.push({
      status : false,
      description : txt,
    });
    initMemo(); // 인풋창 초기화
    alert('저장성공!');
  }
}

// 삭제
function delete_data(key){
  if(!confirm('정말 삭제하시겠습니까?')){
    return;
  }
  var todoRef = database.ref('list/'+userInfo.uid+'/'+key); // DB경로지정
  todoRef.remove(); // DB 삭제기능
  $("#"+key).remove(); // jQuery DOM 삭제기능
}


// 인풋창 초기화
function initMemo(){
  $(".input_to_do").val("");
}



//로그아웃
function logout(){
  $('tbody').children().remove(); // 리스트 DOM 삭제
  firebase.auth().signOut().then(function(){
    alert('로그아웃 성공!');
  });
}
