import React from 'react';
import './App.css';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';

import { useState, useEffect, useRef } from 'react';

const apiUrl= "https://private-anon-520ba36d5a-inventurestest.apiary-mock.com/"

function App() {
  const [error, setError] = useState(null);
  const [isLoaded1, setIsLoaded1] = useState(false);
  const [isLoaded2, setIsLoaded2] = useState(false);
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [now, setNow] = useState("")

  const previousValues = useRef({ isLoaded1, isLoaded2 });

  useEffect(() => {
    fetch(apiUrl + "products", {
      method: 'GET'
    })
      .then(res => res.json())
      .then( 
        (result) => {
          // console.log(result)
          setIsLoaded1(true);
          setProducts(result.payload);
        },
        (err) => {
          setIsLoaded1(true);
          setError(err);
        }
      )
    fetch(apiUrl + "purchases", {
      method: 'GET'
    })
      .then(res => res.json())
      .then(
        (result) => {
          setIsLoaded2(true);
          setPurchases(result.payload);
        },
        (err) => {
          setIsLoaded2(true);
          setError(err);
        }
      )
    setNow(new Date("2022-05-15T15:06:00Z"));
  }, [])

  useEffect(() => {
    if (previousValues.current.isLoaded1 !== isLoaded1 && previousValues.current.isLoaded2 !== isLoaded2
      && products && purchases) {
      console.log(purchases)
      const curPurchases = []; 
      const allPurchases = purchases;
      console.log(allPurchases)
      allPurchases.sort((a, b) => Date(a.received_date) < Date(b.received_date) ? 1 : -1);
      allPurchases.forEach( (purchase) => {
        const thisDate = new Date(purchase.received_date);
        purchase.details.forEach( (item) => {
          const curProdIdx = curPurchases.findIndex(e => e.id === item.product_id)
          if (curProdIdx < 0) {
            curPurchases.push({
              id: item.product_id,
              quantity: item.quantity,
              last_bought: purchase.received_date
            })
          } else {
            const lastDate = new Date(curPurchases[curProdIdx].last_bought);
            const amountLeft = Math.max(curPurchases[curProdIdx].quantity - 
              Math.ceil((thisDate - lastDate)/(1000 * 60 * 60 * 24)), 0);
            curPurchases[curProdIdx].quantity = amountLeft + item.quantity;
            curPurchases[curProdIdx].last_bought = purchase.received_date;
          }
        })
      })
      curPurchases.forEach((item, i) => {
        const lastBought = new Date(item.last_bought);
        curPurchases[i].quantity = Math.max(item.quantity - 
          Math.ceil((now - lastBought)/(1000 * 60 * 60 * 24)), 0);
        const curProduct = products.find(e => e.id === item.id);
        curPurchases[i].name = curProduct.name;
        curPurchases[i].concentration = curProduct.concentration;
        curPurchases[i].imageUrl = curProduct.imagesUrl;
      })
      setMyItems(curPurchases)
      previousValues.current = { isLoaded1, isLoaded2 };
    }
  }, [isLoaded1, isLoaded2, purchases, now, products]);

  const showItems = myItems.map((item) =>
    <ListItem key={item.id}>
      <ListItemAvatar>
        {/* <Box
          component="img"
          alt={item.name}
          src={item.imageUrl}
          sx={{width: "auto", height: "100%"}}/>  */}
          <Avatar alt={item.name} 
            src={item.imageUrl} 
            variant="square"
            sx={{maxWidth: "100%", height: "auto"}}/>
      </ListItemAvatar>
      <ListItemText
        primary={item.name}
        secondary={
          <React.Fragment>
            <Box >{item.concentration}</Box>
            <Box className={item.quantity <= 5 ?  "Danger" : "Normal"}>Quedan {item.quantity} comprimidos</Box>
            <Box className={item.quantity <= 5 ?  "Danger" : "Normal"}>Para {item.quantity} dias</Box>
          </React.Fragment>
        }
      />
      <Divider variant="inset" component="li" />
    </ListItem>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Mi pastillero
          </Typography>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <SearchIcon />
          </IconButton>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <ShoppingCartIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box 
        sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
          }}>
        <Box className='TitleText'>Revisa tus compras</Box>
        <Box className='Subtitle'>Agrega al carro si necesitas reponer</Box>
        
      </Box>
      <Box
        sx={{
          background: '#F5F5F5'
        }}>
        <Box className='TitleText'>Te queda</Box>
      </Box>
      <List
        sx={{ 
          width: '100%', 
          maxWidth: 360, 
          bgcolor: '#FFFFFF' }}>
        {showItems}
      </List>

    </Box>  
  );
}

export default App;
