/**
 * Provides a dice rolling command specialized for Age of Sigmar: Soulbound.
 * The syntax for the command is
 * !r {skill name} [DNX:Y] ["Any notes about the skill roll"]
 *
 * e.g.
 * !r arcana DN3:2 "I inspect the magical artifact to learn of its purpose"
 *
 * The skill name is case-insensitive and supports shortened names. For example
 * instead of rolling "!r arcana", you can roll "!r arc".
 *
 * In order to roll a skill check for a character, you must be currently
 * speaking as that character.
 */
SoulboundDice = (function() {

    var cmd = "!r ";

    //This is a simple way to process the input focus/number of dice
    function DoPlusMinus(s) {
       var total = 0
       s = s.replace("+-", "-")
       s = s.match(/[+\-]*(\.\d+|\d+(\.\d+)?)/g) || [];
       while (s.length) {
          total += parseFloat(s.shift());
       }
       return total;
    }

    /**
     * Gets the character the player is currently speaking as.
     * @param {String} playerId     The player's ID.
     * @return {Character}
     */
    function getCharacter(playerId) {
        var player = findObjs({
          _type: 'player',
          _id: playerId
        })[0];

        var speakingAs = player.get('speakingas') || player.get('_displayname');
        if(speakingAs.indexOf('player') === 0)
            throw new Error('You are not currently speaking as a character.');
        else if(speakingAs.indexOf('character') === 0) {
            var characterId = speakingAs.replace('character|', '');
            return findObjs({
              _type: 'character',
              _id: characterId
            })[0];
        }
        else {
            var character = findObjs({
                _type: 'character',
                name: speakingAs
            })[0];
            if(character)
                return character;
            else
                throw new Error('Bad speakingas value: ' + speakingAs);
        }
    }
    
    // Handling the asynchronious roll
    const sendChatP = function(msg){
		return new Promise((resolve) =>{
			sendChat('',msg.replace(/\[\[\s+/g,'[['),(res)=>{
				resolve(res);
			});
		});
	};
	
    function performRoll(charname, skillname, dice, focus, dn) {
	    return new Promise((resolve,reject) => {
		    sendChatP('[[ (' + dice + ')d6s>' + dn +' ]]').then(function(ops) {
			    if (ops[0].content == "$[[0]]") {
			        var focus_left = focus;
			        var cnt = parseInt(ops[0].inlinerolls[0].results.rolls[0].dice)-1;
                 var difficulty = dn;
			        var origroll = "";
			        var focusroll = "";
			        var success = 0;
			        var modified = false;
                 for(; cnt >= 0; --cnt) {
                    if(ops[0].inlinerolls[0].results.rolls[0].results[cnt].v == 6) {
                       origroll += "<span style=\"font-size: 250%;color:gold\">"
                     }
                     else if(ops[0].inlinerolls[0].results.rolls[0].results[cnt].v >= difficulty) {
                        origroll += "<span style=\"font-size: 250%;color:green\">" 
                     }
                     else {
                        origroll += "<span style=\"font-size: 250%;color:red\">"
                     }
                        
                     if(ops[0].inlinerolls[0].results.rolls[0].results[cnt].v == 6) {
                        origroll += "\u2685"
                     }
                     else if (ops[0].inlinerolls[0].results.rolls[0].results[cnt].v == 5) {
                        origroll += "\u2684"
                     }
                     else if (ops[0].inlinerolls[0].results.rolls[0].results[cnt].v == 4) {
                        origroll += "\u2683"
                     }
                     else if (ops[0].inlinerolls[0].results.rolls[0].results[cnt].v == 3) {
                        origroll += "\u2682"
                     }
                     else if (ops[0].inlinerolls[0].results.rolls[0].results[cnt].v == 2) {
                        origroll += "\u2681"
                     }
                     else {
                        origroll += "\u2680"
                     }
                     origroll += "</span>"
                        
                     while(ops[0].inlinerolls[0].results.rolls[0].results[cnt].v < difficulty && focus_left != 0) {
                        modified = true;
                        ops[0].inlinerolls[0].results.rolls[0].results[cnt].v += 1;
                        focus_left -= 1;
                     }
                        
                        
                     if(modified && ops[0].inlinerolls[0].results.rolls[0].results[cnt].v >= difficulty) {
                        focusroll += "<span style=\"font-size: 250%;color:orange\">"
                     }
                     else if(ops[0].inlinerolls[0].results.rolls[0].results[cnt].v == 6) {
                        focusroll += "<span style=\"font-size: 250%;color:gold\">"
                     }
                     else if(ops[0].inlinerolls[0].results.rolls[0].results[cnt].v >= difficulty) {
                        focusroll += "<span style=\"font-size: 250%;color:green\">" 
                     }
                     else {
                        focusroll += "<span style=\"font-size: 250%;color:red\">"
                     }
                        
                     if(ops[0].inlinerolls[0].results.rolls[0].results[cnt].v == 6) {
                        focusroll += "\u2685"
                     }
                     else if (ops[0].inlinerolls[0].results.rolls[0].results[cnt].v == 5) {
                        focusroll += "\u2684"
                     }
                     else if (ops[0].inlinerolls[0].results.rolls[0].results[cnt].v == 4) {
                        focusroll += "\u2683"
                     }
                     else if (ops[0].inlinerolls[0].results.rolls[0].results[cnt].v == 3) {
                        focusroll += "\u2682"
                     }
                     else if (ops[0].inlinerolls[0].results.rolls[0].results[cnt].v == 2) {
                        focusroll += "\u2681"
                     }
                     else {
                        focusroll += "\u2680"
                     }
                        
                     focusroll += "</span>"
                        
                     if(ops[0].inlinerolls[0].results.rolls[0].results[cnt].v >= difficulty)
                     {
                        success += 1;
                     }
                     modified = false;
			        }
                 // var degree = ""
                 //if(success == complexity) {
                 //  degree = "Succes"
                 //}
                 //else if(success < complexity) {
                 // degree = "Failure"
                 //}
                 //else if(success == complexity+1 || success == complexity+2)
                 //{
                 //     degree = "Minor Benefit"
                 // }
                 //else{
                 // degree = "Major Benefit"
                 //}
                 result = "\&{template:default} {{name=" + charname + "=>" + skillname + "}}"
                 result += " {{DN=" + difficulty + "}} {{Raw=" + origroll + "}}" 
                 result += " {{Result=" + focusroll + "}} {{focus=" + focus + " focus points}}"
                 result += " {{Succeses=" + success + " }}"
				 resolve(result)
			    } else {
				    // Error handling.
				    printError(ops[0], msg.who);
				    reject();
		    	} // if
		    });
	    });
    } // performRoll

    on("chat:message", function(msg) {
        try {
            if(msg.type == "api" && msg.content.indexOf(cmd) !== -1) {
                var playerId = msg.playerid;
                var character = getCharacter(playerId);
                var str = msg.content.replace(cmd, "");

                // Process the roll command by splitting it by spaces
                //
                // group 1 is the skill name.
                var match = str.split(" ");
                var skillName = match[0];
                //Evaluate the sums
                var dice = DoPlusMinus(match[1]);
                var focus = DoPlusMinus(match[2]);
                var dn = match[3];
                var disp = match[4];
                var notes = match[5];
                prefix = ''
                if(disp == "Private") {
                    prefix = '/w "' + character.get('name') + '" '
                }
                if(match) {
                    performRoll(character.get('name'), skillName, dice, focus, dn).then(res => {
	                      sendChat(character.get('name'), prefix+res);
                      }).catch(e=>{
                        sendChat("ERROR", "/w " + msg.who + " Error processing roll: " + msg.content);
                        log('AOS Dice ERROR: ' + err.message);
                     });  
                }
                else
                    throw new Error('Bad roll format. Expected format: {skill name} ["DNX:Y" corresponding to the difficulty number] ["any notes about the roll"]');
            }
        }
        catch(err) {
            sendChat("ERROR", "/w " + msg.who + " Error processing roll: " + msg.content);
            log('AOS Dice ERROR: ' + err.message);
        }

    });
})();
