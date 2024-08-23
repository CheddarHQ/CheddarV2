// TODO: future add PUB/SUB for broadcasting mesasges


//placeholder code for broadcasting a mesasge



broadcast(message:string){
    // Apply JSON incase the message is not a string 
    if(typeof message !== 'string'){
        message = JSON.stringify(message);
    }

    //iterate over all the clients and send them messages
    let quitters = [];
    this.sessions = this.sessions.filter((client)=>{
        if(session.name){
            try{
                session.WebSocket.send(message);
                return true;
            }
            catch(error){
                //handle connection failure
                return false;
            }
        }
        else{
            //queue the message in blockedMessages[] for it to be sent later if the user hasn't provided a name or a unique id yet
            session.blockedMessages.push(message);
            return true;
        }
    })


    quitters.forEach((quitter)=>{
        if(quitter.name){
            this.broadcast({quit:quitter.name})
        }
    }
}