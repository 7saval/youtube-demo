// express 모듈 셋팅
const express = require('express')
const router = express.Router() // 해당 파일을 express 라우터로 사용 가능
const conn = require('../mariadb')  // db 모듈 가져오기

// 테스트
conn.query(
  'SELECT * FROM `users`',
  function (err, results, fields) {
    var {id, email, name, created_at} = results[0];

    console.log(id);
    console.log(email);
    console.log(name);
    console.log(created_at);
  }
);

router.use(express.json()) // http 외 모듈 'json'

let db = new Map();
var id = 1; // 하나의 객체를 유니크하게 구별하기 위함


// 로그인
router.post('/login',(req,res)=>{
    const loginInfo = req.body;
    console.log(loginInfo);     // userId, pwd

    // userId가 DB에 저장된 회원인지 확인
    const {userId, pwd, name} = loginInfo
    var loginUser = {}

    db.forEach((user, id)=>{
        // a : 데이터, value
        // b : 인덱스, key
        // c : 전체 객체, Map
        if(user.userId === userId){
            loginUser = user;   // 찾은 user 변수에 넣기
        } 
    })

    if(isExist(loginUser)){
            
        // pwd도 맞는지 비교
        if(loginUser.pwd === pwd){
            res.status(200).json({
                message : `${loginUser.name}님 환영합니다.`
            })
        }else{
            res.status(400).json({
                message : "비밀번호가 일치하지 않습니다."
            })
        }
    }
    // userId 값을 못 찾았으면
    else{
        res.status(404).json({
            message : "회원 정보가 없습니다."
        })
    }
})

// 객체 값 존재하는지 확인 함수
function isExist(obj){
    if(Object.keys(obj).length){
        return true;
    }else{
        return false;
    }
}

// 회원가입
router.post('/join',(req,res)=>{
    const userInfo = req.body;
    
    if(Object.keys(userInfo).length > 0){
        db.set(userInfo.userId, userInfo);
        
        res.status(201).json({
            // message : `${userInfo.name}님 환영합니다.`
            message : `${db.get(userInfo.userId).name}님 환영합니다.`  // 저장된 db 확인하는 개념
        })
    } else{
        res.status(400).json({
            message : "입력 값을 다시 확인해주세요."
        })
    }
    
})

// 회원 개별 조회, 개별 탈퇴 라우팅
router.route('/users')
    .get((req,res)=>{
        let {userId} = req.body;
        let user = db.get(userId)

        if(user){
            res.status(200).json({
                userId : user.userId,
                name : user.name
            })
        }
        else{
            res.status(404).json({
                message : "존재하지 않는 회원입니다."
            })
        }
    })
    .delete((req,res)=>{
        let {userId} = req.body;
        let user = db.get(userId)

        if(user){
            db.delete(userId)

            res.status(200).json({
                message : `${user.name}님 다음에 또 뵙겠습니다.`
            })
        }
        else{
            res.status(404).json({
                message : "존재하지 않는 회원입니다."
            })
        }
    })

module.exports = router;