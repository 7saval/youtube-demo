// express 모듈 셋팅
const express = require('express')
const app = express()
const port = 7777
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.use(express.json()) // http 외 모듈 'json'

let db = new Map();
var id = 1; // 하나의 객체를 유니크하게 구별하기 위함


// 로그인
app.post('/login',(req,res)=>{
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
        console.log("찾았다");
            
        // pwd도 맞는지 비교
        if(loginUser.pwd === pwd){
            res.status(200).json({
                message : `${name}님 환영합니다.`
            })
        }else{
            res.status(404).json({
                message : "비밀번호가 일치하지 않습니다."
            })
        }
    }
    // userId 값을 못 찾았으면
    else{
        res.status(404).json({
            message : "없는 아이디입니다."
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
app.post('/join',(req,res)=>{
    const userInfo = req.body;
    console.log(userInfo);
    
    if(Object.keys(userInfo).length > 0){
        db.set(id++, userInfo);
        
        res.status(201).json({
            // message : `${userInfo.name}님 환영합니다.`
            message : `${db.get(id-1).name}님 환영합니다.`  // 저장된 db 확인하는 개념
        })
    } else{
        res.status(400).json({
            message : "입력 값을 다시 확인해주세요."
        })
    }
    
})

// 회원 개별 조회, 개별 탈퇴 라우팅
app.route('/users/:id')
    .get((req,res)=>{
        let {id} = req.params;
        id = parseInt(id)
        let user = db.get(id)

        console.log(user);
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
        let {id} = req.params;
        id = parseInt(id)
        let user = db.get(id)

        console.log(user);
        if(user){
            db.delete(id)

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

// 회원 개별 조회
// app.get('/users/:id',(req,res)=>{
//     let {id} = req.params;
//     id = parseInt(id)
//     let user = db.get(id)

//     console.log(user);
//     if(user){
//         res.status(200).json({
//             userId : user.userId,
//             name : user.name
//         })
//     }
//     else{
//         res.status(404).json({
//             message : "존재하지 않는 회원입니다."
//         })
//     }
// })

// 회원 개별 탈퇴
// app.delete('/users/:id',(req,res)=>{
//     let {id} = req.params;
//     id = parseInt(id)
//     let user = db.get(id)

//     console.log(user);
//     if(user){
//         db.delete(id)

//         res.status(200).json({
//             message : `${user.name}님 다음에 또 뵙겠습니다.`
//         })
//     }
//     else{
//         res.status(404).json({
//             message : "존재하지 않는 회원입니다."
//         })
//     }
// })