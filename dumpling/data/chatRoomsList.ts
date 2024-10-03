// Function to convert chat rooms to chat list format

interface roomProps{
    id : string,
    name : string,
    description : string,
    admin_id : string,
    created_at: string,
    avatar  : string
}

function generateChatList(rooms : roomProps[]) {
    return rooms.map(room => {
        return {
            key: room.id,
            name: room.name,
            avatar: room.avatar,
            date: room.created_at,
            message: `@${room.name.replace(/\s+/g, '')}`, // Create message from room name
        };
    });
}

