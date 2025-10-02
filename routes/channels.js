// express 모듈 셋팅
const express = require('express')
const router = express.Router() // 해당 파일을 express 라우터로 사용 가능
const conn = require('../mariadb')  // db 모듈 가져오기
const {body, param, validationResult} = require('express-validator') // 유효성검사 모듈(body: 내가만든 변수, validationResult : 에러 시 결과값)

router.use(express.json()) // http 외 모듈 'json'

// 파일 내부 함수 모듈화 가능 - 미들웨어
// 무한대기 이유 : 에러가 없을 때 리턴값이 없다.
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

// 공통함수
// function validate (req, res){
//     const err = validationResult(req)

//     if(!err.isEmpty()){
//         // 리턴으로 if문 종료
//         return res.status(400).json(err.array())
//     }
// }

router
    .route('/')
    // 라우터 핸들러를 실행하기 전에 수행해야 할 미들웨어 조직
    .get(
        [
            body('userId').notEmpty().isInt().withMessage('숫자 입력 필요!')
            , validate
        ]
        , (req,res,next)=>{

            // validate(req, res)
            // const err = validationResult(req)

            // if(!err.isEmpty()){
            //     // 리턴으로 if문 종료
            //     return res.status(400).json(err.array())
            // }

        var {userId} = req.body

        let sql = `SELECT * FROM channels WHERE user_id = ?`
        // 단축평가 : 앞에 먼저 true/false 체크하고 true면 다음 조건 체크
        // userId && conn.query(sql, userId,
        // if(userId){
            conn.query(sql, userId,
                function (err, results) {
                    if(err){
                        console.log(err)
                         return res.status(400).end()
                    }

                    if(results.length){
                        res.status(200).json(results)
                    }else{
                        notFoundChannel(res)
                    }
                }
            )
        // }
        // else{
            // res.status(400).end()
        // }
    })      // 채널 전체 조회
    .post(
        // validator한테 userId 검사해줘 명령
       [
        body('userId').notEmpty().isInt().withMessage('숫자 입력 필요!'),
        body('name').notEmpty().isString().withMessage('문자 입력 필요!'),
        validate
       ] 
        , (req,res)=>{
            const {name, userId} = req.body
            // validation 하므로 if문 필요없음
            // if(name && userId){
                let sql = `INSERT INTO channels (channel_name, user_id)
                    VALUES (?, ?)`
                let values = [name, userId]
                // INSERT 쿼리문
                conn.query(sql, values,
                    function (err, results) {
                        if(err){
                            console.log(err)
                            return res.status(400).end()
                        }
                        res.status(201).json(results)
                    }
                );
            // }
            // else{
                // res.status(400).json({
                //     message : "입력 값을 다시 확인해주세요."
                // })
            // }
            
        })     // 채널 개별 생성


router
    .route('/:id')
    .get(
        [
            param('id').notEmpty().withMessage('채널id 필요!'),
            validate
        ]
        , (req,res)=>{
            let {id} = req.params;
            id = parseInt(id);

            let sql = `SELECT * FROM channels WHERE id = ?`
            // SELECT 쿼리문
            conn.query(sql, id,
                function (err, results) {
                    if(err){
                        console.log(err)
                            return res.status(400).end()
                    }

                    if(results.length)
                        res.status(200).json(results)
                    else
                        notFoundChannel(res)
                }
            );        
        })      // 채널 개별 조회
    .put(
        [
            param('id').notEmpty().withMessage('채널id 필요!'),
            body('name').notEmpty().isString().withMessage('채널명 오류!'),
            validate
        ]
        , (req,res)=>{
            let {id} = req.params;
            id = parseInt(id);
            let {name} = req.body

            let sql = `UPDATE channels SET channel_name = ? WHERE id = ?`
            let values = [name, id]
            // UPDATE 쿼리문
            conn.query(sql, values,
                function (err, results) {
                    if(err){
                        console.log(err)
                        return res.status(400).end()
                    }

                    // 업데이트 잘 되었는지 유효성 검사
                    if(results.affectedRows == 0){
                        return res.status(400).end()
                    }else{
                        res.status(200).json(results)
                    }
                }
            ); 

            // const channel = db.get(id); // db에서 채널 찾기
            // var oldTitle = channel.channelTitle;    // db 채널 old타이틀 변수 보관

            // if(req.body && channel){
            //     var newTitle = req.body.channelTitle;   // req.body에서 new타이틀 보관
            //     channel.channelTitle = newTitle;
            //     // db에 덮어쓰기
            //     db.set(id, channel);

            //     res.status(200).json({
            //         message : `${oldTitle} -> ${newTitle} 으로 수정되었습니다.`
            //     })
            // }
            // else{
            //     notFoundChannel()
            // }
        })      // 채널 개별 수정
    .delete(
        [
            param('id').notEmpty().withMessage('채널id 필요!'),
            validate
        ]
        , (req,res)=>{
            let {id} = req.params;
            id = parseInt(id);

            let sql = `DELETE FROM channels WHERE id = ?`
            // DELETE 쿼리문
            conn.query(sql, id,
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
        })   // 채널 개별 삭제


function notFoundChannel(res){
    res.status(404).json({
        message : "채널 정보가 없습니다."
    })
}

module.exports = router;