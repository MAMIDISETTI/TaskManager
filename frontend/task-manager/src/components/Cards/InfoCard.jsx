import React from 'react'

const InfoCard = ({icon, label, value, color, onClick, clickable = false}) => {
  return (
    <div 
      className={`flex items-center gap-3 ${clickable ? 'cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors' : ''}`}
      onClick={onClick}
    >
      {icon ? (
        <div className={`p-2 ${color} rounded-full text-white`}>
          {icon}
        </div>
      ) : (
        <div className={`w-2 md:w-2 h-3 md:h-5 ${color} rounded-full`} />
      )}

      <p className="text-[20px] md:text-[18px] text-gray-700">
        <span className="text-[18px] md:text-[22px] text-black font-semibold">{value}</span> {label}
      </p>
    </div>
  )
}

export default InfoCard