// express 모듈 셋팅
const express = require('express')
const router = express.Router() // 해당 파일을 express 라우터로 사용 가능

router.use(express.json()) // http 외 모듈 'json'

let db = new Map();
var id = 1; // 하나의 객체를 유니크하게 구별하기 위함


router
    .route('/')
    .get((req,res)=>{
        var {userId} = req.body
        // json array(여러개 json의 배열) 로 보내기
        var channels = []

        // 예외 처리 2가지
            // 1) userId가 body에 없으면
            // 2) userId가 가진 채널이 없으면
        if(db.size && Object.keys(req.body).length > 0 && userId){
            db.forEach((value, key) => {
                if(value.userId === userId){
                    channels.push(value)
                }
            })

            if(channels.length){
                // 꺼낼 때 channels[0]
                res.status(200).json(channels)
            }
            else{
                notFoundChannel()
            }
        } else{
            notFoundChannel()
        }

    })      // 채널 전체 조회
    .post((req,res)=>{
        var channel = req.body
        if(channel && channel.channelTitle){
            
            // db 등록
            db.set(id++, channel);

            res.status(201).json({
                message : `${db.get(id-1).channelTitle} 채널이 생성되었습니다.`
            })
        }
        else{
            res.status(400).json({
                message : "입력 값을 다시 확인해주세요."
            })
        }
        
    })     // 채널 개별 생성


router
    .route('/:id')
    .get((req,res)=>{
        let {id} = req.params;
        id = parseInt(id);
        const channel = db.get(id);

        if(channel){
            res.status(200).json({
                userId : channel.userId,
                channelTitle : channel.channelTitle,
            })
        }
        else{
            notFoundChannel()
        }
    })      // 채널 개별 조회
    .put((req,res)=>{
        let {id} = req.params;
        id = parseInt(id);
        const channel = db.get(id); // db에서 채널 찾기
        var oldTitle = channel.channelTitle;    // db 채널 old타이틀 변수 보관

        if(req.body && channel){
            var newTitle = req.body.channelTitle;   // req.body에서 new타이틀 보관
            channel.channelTitle = newTitle;
            // db에 덮어쓰기
            db.set(id, channel);

            res.status(200).json({
                message : `${oldTitle} -> ${newTitle} 으로 수정되었습니다.`
            })
        }
        else{
            notFoundChannel()
        }
    })      // 채널 개별 수정
    .delete((req,res)=>{
        let {id} = req.params;
        id = parseInt(id);
        const channel = db.get(id);

        if(channel){
            db.delete(id);

            res.status(200).json({
                message : `${channel.channelTitle} 채널이 삭제되었습니다.`
            })
        }
        else{
            notFoundChannel()
        }
    })   // 채널 개별 삭제


function notFoundChannel(){
    res.status(404).json({
        message : "존재하지 않는 채널입니다."
    })
}




module.exports = router;