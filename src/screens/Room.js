import React from 'react'
import { useParams,useNavigate } from 'react-router-dom'
const navigate = useNavigate()
import { v4 as uuid } from "uuid";
const create =(props)=>{
    const {id}=useParams();
    props.navigate(`/room/:${id}`)

}

const Room = () => {
  return (
    <div>Room</div>
  )
}

export default Room