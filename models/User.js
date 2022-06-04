const mongoose = require('mongoose');    // mongoose 연결
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema( {    // 스키마 세팅
  name:  {
    type: String,  
    maxlength: 50
  },
  email: {
    type: String,
    trim: true,               // 공백 제거
    unique: 1                 // email 중복 안됨
  },
  password: {
    type: String,
    minlength: 5
  },
  lastname: {
    type: String,
    maxlength: 50
  },
  role: {                      //가입자(디폴트, 0), 관리자
    type: Number, 
    default: 0
  },
  image: String,
  token: {                     // 토큰 설정 (나중에 유효성 관리 가능)
    type: String
  },
  tokenExp: {                  // 토큰 유효기간
    type: Number
  }
})

// DB에 저장할때 비밀번호 암호화
userSchema.pre('save', function(next) {
    //비밀번호 암호화
    var user = this;
    if(user.isModified('password')) {  // pw변경시에만 해쉬값 넣도록
      bcrypt.genSalt(saltRounds, function(err, salt) {
        if(err) return next(err) //에러나오면 index로
        bcrypt.hash(user.password, salt, function(err, hash) {
          // Store hash in your password DB.
          if(err) return next(err)
          user.password = hash
          next()  // hash값 저장했으면 index로
        });
      });
    } else {
      next()
    }
  })

userSchema.methods.comparePassword = function(plainPassword, cb) {
// plainPassword 1234567 일 때 암호화된 비밀번호(해쉬값) 비교
bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
    if(err) return cb(err),
    cb(null, isMatch)
})
}

userSchema.methods.generateToken = function(cb) {
    var user = this; // ES5문법
    //jsonwebtoken이용해서 token생성
    var token = jwt.sign(user._id.toHexString(), 'secretToken') 
    //user._id + 'secretToken' = token
    //_id는 데이터베이스에 저장된 id값
    // -> 'secretToken' -> user_.id 확인가능
    user.token = token
    user.save(function(err, user) {
      if(err) return cb(err)
      cb(null, user)
    })
  }
  
const User = mongoose.model('testUser', userSchema)  // 모델
module.exports = { User }                        // export