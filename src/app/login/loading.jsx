import ZorofyAudioLoader from '@/components/ZorofyAudioLoader'

const loading = () => {
  return (
    <div className=' w-screen h-screen flex justify-center items-center'>
        <ZorofyAudioLoader size="large" label="Tuning your experience..." />
    </div>
  )
}

export default loading
