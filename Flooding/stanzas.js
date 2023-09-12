const { xml } = require("@xmpp/client");

const stanzas = {

    onlineStanza: () => {
        const presenceStanzaa = xml(
            "presence",
            {
                id: "online",
            },
            xml("show", {}, "available"),
        )
        return presenceStanzaa;
    },

    presenceStanza: (show, status = null) => {
        let presenceStanzaa = xml(
            "presence",
            {
                id: "getContactsInfo",
            }
            );

        if (status !== null) {
            presenceStanzaa.children.push(xml("show", {}, show));
            presenceStanzaa.children.push(xml("status", {}, status));
        }

        return presenceStanzaa;
    },

    offline: () => {
        const offlineStanza = xml(
            "presence",
            {
                id: "goodbye",
            },
            xml("show", {}, "Offline")
        )

        return offlineStanza;
    },

    rosterRequest: (jid) => {
        const rosterStanza = xml(
            "iq",
            {
                id: "getRoster",
                to: jid,
                type: "get"
            },
            xml("query", { xmlns: "jabber:iq:roster" })
        )

        return rosterStanza;
    },

    getInfoContact: (jid) => {
        const contactStanza = xml(
            "presence",
            {
                id: "getContactsInfo",
                to: `${jid}@alumchat.xyz`,
                type: "probe"
            }
        )
        return contactStanza;
    },

    addUser: (jid) => {
        const addUserStanza = xml(
            'presence',
            { 
                id: 'friendRequest',
                to: `${jid}@alumchat.xyz`, 
                type: 'subscribe' }
        );
        return addUserStanza;
    },

    acceptRequest: (jid) => {
        const request = xml(
            "presence",
            { 
                to: `${jid}@alumchat.xyz`,
                type: "subscribed"
            },
        );
        return request;
    },

    joinRoom: (roomJID, userJID) => {
        const joinRoomStanza = xml(
            "presence",
            {
                to: `${roomJID}@conference.alumchat.xyz/${userJID}`,
                from: `${roomJID}@conference.alumchat.xyz/${userJID}`
            }
        );

        const xElement = xml(
            "x",
            {
                xmlns: "http://jabber.org/protocol/muc#user"
            }
        );

        const itemElement = xml(
            "item",
            {
                jid: `${userJID}`,
                affiliation: "owner",
                role: "moderator"
            }
        );

        xElement.append(itemElement);
        joinRoomStanza.append(xElement);

        console.log(joinRoomStanza.toString())
        return joinRoomStanza;
    },

    addUserToRoom: (userJID, roomName) => {
        const stanza = xml(
            "iq",
            {
                to: `${roomName}@conference.alumchat.xyz`,
                type: "set",
                id: "addUserToRoom"
            },
            xml(
                "query",
                {
                    xmlns: "http://jabber.org/protocol/muc#admin"
                },
                xml(
                    "item",
                    {
                        jid: userJID,
                        affiliation: "owner"
                    }
                )
            )
        );

        return stanza;
    },

    acceptGroupInvite: (roomJID) => {
        const acceptStanza = xml(
            "presence",
            {
                to: `${roomJID}@conference.alumchat.xyz`,
            },
            xml("show", {}, "Available"),
        );
        return acceptStanza;
    },

    privateMessage: (message, to) => {
        const privateMessageStanza = xml(
            "message",
            {
                id: `privateChatMessage`,
                to: `${to}@alumchat.xyz`,
                type: "chat"
            },
            xml("body", {}, message)
        );
        return privateMessageStanza;
    },

    groupMessage: (message, room, from) => {
        const groupMessageStanza = xml(
            "message",
            {
                id: `groupChatMessage`,
                to: `${room}@conference.alumchat.xyz/${from}`,
                type: "groupchat"
            },
            xml("body", {}, message)
        );

        return groupMessageStanza;
    },

    sendFile: (to, filePath) => {
        const fs = require('fs');
        const fileData = fs.readFileSync(filePath, { encoding: 'base64' });
        const msg = filePath.replace('./', '');
        const sendFileStanza = xml(
            'message',
            {
                id: 'sendFile',
                to: `${to}@alumchat.xyz`,
                type: 'chat'
            },
            xml('body', {}, msg),
            xml(
                'attachment',
                {
                    xmlns: 'urn:xmpp:attachment',
                    id: 'attachment1',
                    encoding: 'base64'
                },
                fileData
            )
        );
        return sendFileStanza;
    },

    createChatRoomStanza: (room, jid) => {
        const presenceStanza = xml(
            "presence",
            {
                to: `${room}@conference.alumchat.xyz/${jid}`
            }
        )
        const xElement = xml(
            "x",
            {
                xmlns: "http://jabber.org/protocol/muc"
            }
        );
        presenceStanza.append(xElement);

        return presenceStanza;
    },

    generateConfigStanza: (room) => {
        const configStanza = xml(
            'iq',
            {
                to: '${room}@conference.alumchat.xyz',
                type: 'get'
            },
            xml('query', { xmlns: 'http://jabber.org/protocol/muc#owner' })
        );

        return configStanza;
    },

    deleteAccount: (jid, password) => {
        const deleteAccountStanza = xml(
            'iq', 
            { 
                type: 'set', 
                id: 'delete-account'
            },
            xml('query', { xmlns: 'jabber:iq:register' },
            xml("username", {}, '${jid}@alumchat.xyz'),
            xml("password", {}, password),
            xml("remove"),
        ));
        
        return deleteAccountStanza;
    }

};

module.exports = stanzas;