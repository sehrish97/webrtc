import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";

const Room = (props) => {
    const navigate = useNavigate();

    const createRoom = useCallback(() => {
        const id = uuid();
        navigate(`/room/${id}`);
    }, [])

    return (
        <button onClick={createRoom}>Create Room</button>
    );
}


export default Room