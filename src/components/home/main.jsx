import Middle from './middle.jsx'
import RightSidebar from './rightsidebar.jsx'

const Main = () => {
  return (
    <>
      <div className='flex justify-between items-start h-full w-full px-1 py-6 gap-6'>
        <Middle />
        <RightSidebar />
      </div>
    </>
  )
}

export default Main
