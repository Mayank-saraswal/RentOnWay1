import React from 'react'
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'
import NewsletterBox from '../components/NewsletterBox'
import NewArrivals from '../components/NewArrivals'
import CollegeWear from '../components/CollegeWear'
import PartyWear from '../components/PartyWear'
import WeddingSpecials from '../components/WeddingSpecials'
import FestivalWear from '../components/FestivalWear'
import ConnectionStatus from '../components/ConnectionStatus'

const Home = () => {
  return (
    <div>
      <ConnectionStatus />
      
      <Hero />
      <LatestCollection />
      <BestSeller />
      <OurPolicy />
      <NewsletterBox />
      <NewArrivals />
      <CollegeWear />
      <PartyWear />
      <WeddingSpecials />
      <FestivalWear />
    </div>
  )
}

export default Home
