import React from 'react'
import {AiFillHeart, AiOutlineHeart} from 'react-icons/ai';


const FavouriteButton = ({favouriteSongs, activeSong, loading, handleAddToFavourite, style}) => {
  return (
    <div onClick={(e)=>e.stopPropagation()} className=' mt-2'>
    { favouriteSongs?.length>0 && favouriteSongs?.includes(activeSong.id) ?
        <button type="button" aria-label="Remove from favourites" disabled={loading} onClick={(e)=>{
         handleAddToFavourite(activeSong)}} className={`cursor-pointer`}>
           <AiFillHeart title='Favourite' size={25} color={'#00E676'} className={`${style}`} />
             </button>
          :
          <button type="button" aria-label="Add to favourites" disabled={loading || !activeSong?.id} onClick={(e)=>{
            handleAddToFavourite(activeSong)}} className={`cursor-pointer`}>
          <AiOutlineHeart  title='Favourite' size={25} color={'white'} className={`${style}`} />
          </button>
        }
    </div>
  )
}

export default FavouriteButton
