// express 모듈 셋팅
const express = require('express')
const router = express.Router() // 해당 파일을 express 라우터로 사용 가능
const conn = require('../mariadb')  // db 모듈 가져오기
const {body, param, validationResult} = require('express-validator') // 유효성검사 모듈(body: 내가만든 변수, validationResult : 에러 시 결과값)

// jwt 모듈
const jwt = require('jsonwebtoken')

// dotenv 모듈
const dotenv = require('dotenv')
dotenv.config();

router.use(express.json()) // http 외 모듈 'json'

const validate = (req, res, next) => {
    const err = validationResult(req)

    if(err.isEmpty()){
        return next()   // 다음 할 일(미들웨어, 함수)로 보내기
    }
    else{
        // 리턴으로 if문 종료
        return res.status(400).json(err.array())
    }
}

// 로그인
router.post(
    '/login'
    ,[
        body('email').notEmpty().isString().isEmail().withMessage('이메일 확인 필요!'),
        body('pwd').notEmpty().isString().withMessage('비밀번호 확인 필요!'),
        validate
    ]
    ,(req,res)=>{
        const {email, pwd} = req.body

        let sql = `SELECT * FROM users WHERE email= ?`
        // SELECT 쿼리문
        conn.query(sql, email,
            function (err, results) {
                if(err){
                    console.log(err)
                    return res.status(400).end()
                }

                var loginUser = results[0]

                if(loginUser && loginUser.pwd === pwd){
                    // token 발급 / 유효기간 설정
                    const token = jwt.sign({
                        email : loginUser.email,
                        name : loginUser.name
                    }, process.env.PRIVATE_KEY, {
                        expiresIn : '30m',
                        issuer : 'yj'
                    });

                    // 쿠키에 토큰 담기 - 토큰 변수에 토큰 담기
                    res.cookie("token", token, {
                        httpOnly : true
                    })

                    res.status(200).json({
                        message : `${loginUser.name}님 환영합니다.`,
                        token : token
                    })
                }
                else{
                    res.status(403).json({  // 인증 안됨
                        message : "아이디 또는 비밀번호가 일치하지 않습니다."
                    })
                }
            }
        )
    })

// 회원가입
router.post(
    '/join'
    ,[
        body('email').notEmpty().isString().isEmail().withMessage('이메일 확인 필요!'),
        body('name').notEmpty().isString().withMessage('이름 확인 필요!'),
        body('pwd').notEmpty().isString().withMessage('비밀번호 확인 필요!'),
        body('contact').notEmpty().isString().withMessage('연락처 확인 필요!'),
        validate
    ]
    ,(req,res)=>{
        const userInfo = req.body
        
        const {email, name, pwd, contact} = userInfo

        let sql = `INSERT INTO users (email, name, pwd, contact)
            VALUES (?, ?, ?, ?)`
        let values = [email, name, pwd, contact]
        // INSERT 쿼리문
        conn.query(sql, values,
            function (err, results) {
                if(err){
                    console.log(err)
                    return res.status(400).end()
                }

                // if(results.length){
                    res.status(201).json(results)
                    // res.status(201).json({
                    //     // message : `${userInfo.name}님 환영합니다.`
                    //     message : `${db.get(userInfo.userId).name}님 환영합니다.`  // 저장된 db 확인하는 개념
                    // })
                // }
                // else{
                //     res.status(404).json({
                //         message : "존재하지 않는 회원입니다."
                //     })
                // }
            }
        );
        
    })

// 회원 개별 조회, 개별 탈퇴 라우팅
router.route('/users')
    .get(
        [
            body('email').notEmpty().isString().isEmail().withMessage('이메일 확인 필요!'),
            validate
        ]
        ,(req,res)=>{
            let {email} = req.body

            let sql = `SELECT * FROM users WHERE email= ?`
            // SELECT 쿼리문
            conn.query(sql, email,
                function (err, results) {
                    if(err){
                        console.log(err)
                            return res.status(400).end()
                    }

                    if(results.length){
                        res.status(200).json(results)
                    }
                    else{
                        res.status(404).json({
                            message : "존재하지 않는 회원입니다."
                        })
                    }
                }
            );
        })
    .delete(
        [
            body('email').notEmpty().isString().isEmail().withMessage('이메일 확인 필요!'),
            validate
        ]
        ,(req,res)=>{
            let {email} = req.body

            let sql = `DELETE FROM users WHERE email= ?`
            // DELETE 쿼리문
            conn.query(sql, email,
                function (err, results) {
                    if(err){
                        console.log(err)
                        return res.status(400).end()
                    }
                    
                    // 삭제 잘 되었는지 유효성 검사
                    if(results.affectedRows == 0){
                        // return notFoundChannel(res)
                        return res.status(400).end()
                    }else{
                        res.status(200).json(results)
                    }
                }
            );

        // if(user){
        //     db.delete(userId)

        //     res.status(200).json({
        //         message : `${user.name}님 다음에 또 뵙겠습니다.`
        //     })
        // }
        // else{
        //     res.status(404).json({
        //         message : "존재하지 않는 회원입니다."
        //     })
        // }
      })  

module.exports = router;