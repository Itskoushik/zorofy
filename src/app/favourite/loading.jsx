
import ZorofyAudioLoader from '@/components/ZorofyAudioLoader'

const loading = () => {
  return (
    <div className=' w-screen h-screen flex justify-center items-center'>
        <ZorofyAudioLoader size="large" label="Finding your favourites..." />
    </div>
  )
}

export default loading
