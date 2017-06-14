

exports.peertest = function(req, res){
    var sessionId = req.params.sessionId;
    console.log(sessionId);
    res.render('peer_test', { title: 'YAMANIZM CORP', sessionID: sessionId });
};

exports.appear = function(req, res){
    res.render('appear2');
};
