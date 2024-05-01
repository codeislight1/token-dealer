// import Head from 'next/head'
// import styles from '@/styles/Home.module.css'
import { NETWORKS } from '@/src/config'
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { CopyBlock, dracula } from 'react-code-blocks'
import SettingsIcon from '@mui/icons-material/Settings'
import { ChainBase } from '@/src/ChainBase'
import { isAddress } from 'viem'
import Link from 'next/link'

export default function Home() {
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const [network, setNetwork] = useState('1')
  const [token, setToken] = useState('')
  const [resultStatus, setResultStatus] = useState(false)
  const [whale, setWhale] = useState('')
  const [amount, setAmount] = useState('')
  const [usdAmount, setUsdAmount] = useState('')
  const [error, setError] = useState(false)
  const [key, setKey] = useState('')

  const solSnippet = `function _whaleSend(ERC20 _token, address _whale, address _to) internal {
    uint256 _balance = _token.balanceOf(_whale);
    vm.prank(_whale);
    _token.transfer(_to, _balance);
  }`

  const usageSnippet = `_whaleSend(ERC20(${token}), ${whale}, address(0)); // set 'address(0)' to the receiver`

  const solCompact = `ERC20 _token = ERC20(${token});
address _whale = ${whale};
address _to = address(0); // set 'address(0)' to the receiver
vm.prank(_whale);
_token.transfer(_to, _token.balanceOf(_whale));`

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <List sx={{ width: '600px' }}>
        <ListItem sx={{ justifyContent: 'right' }}>
          <IconButton color="primary" onClick={handleOpen}>
            <SettingsIcon />
          </IconButton>
        </ListItem>
        <ListItem>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Network</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={network}
              label="Network"
              onChange={(e) => {
                console.log(e.target.value)
                setNetwork(e.target.value)
              }}
            >
              {Object.entries(NETWORKS).map(([k, v]) => (
                <MenuItem value={v.toString()}>{k}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </ListItem>
        <ListItem>
          <TextField
            sx={{ width: '100%' }}
            id="outlined-basic"
            label="Token Address"
            variant="outlined"
            value={token}
            onChange={(e) => {
              setToken(e.target.value)
            }}
            error={!!token && !isAddress(token)}
            helperText={!!token && !isAddress(token) && 'Invalid address.'}
          />
        </ListItem>
        <Typography sx={{ display: error ? 'block' : 'none', textAlign: 'center' }} color="error">
          Error Occured
        </Typography>
        <ListItem sx={{ width: '100%' }}>
          <Button
            sx={{ justifyContent: 'left', mb: 2 }}
            variant="contained"
            disabled={!isAddress(token)}
            onClick={async () => {
              const apiKey = localStorage.getItem('chainbase-key') ?? ''
              const axios = require('axios')
              axios(
                {
                  url: `/api/query`,
                  method: 'GET',
                  params: {
                    network: network,
                    token_addr: token,
                  },
                  headers: {
                    'custom-api-key': apiKey, // Replace the field with your API key.
                    accept: 'application/json',
                  },
                },
                null
              )
                .then((response) => {
                  const res = response.data as {
                    success: boolean
                    result: Array<{
                      amount: string
                      original_amount: string
                      usd_value: string
                      wallet_address: string
                    }>
                  }
                  setResultStatus(!!res.result)
                  setError(!res.result)
                  if (res.result) {
                    setWhale(res.result[0].wallet_address)
                    setAmount(res.result[0].amount)
                    setUsdAmount(Number(res.result[0].usd_value).toFixed(2))
                  }
                })
                .catch((error) => console.log('⭕ error while querying:', error))
            }}
          >
            GET WHALE 🐋
          </Button>
        </ListItem>

        {resultStatus && (
          <>
            <Typography variant="h5" style={{ marginBottom: '16px' }}>
              Token Details:
            </Typography>
            <Typography>Whale Address: {whale}</Typography>
            <Typography>Amount: {amount}</Typography>
            <Typography>USD Value: {usdAmount}</Typography>
            <div style={{ marginBottom: '16px' }}></div>
            <Typography variant="h5" style={{ marginBottom: '16px' }}>
              Snippets:
            </Typography>
            <Typography>Function:</Typography>
            <CopyBlock
              language={'javascript'}
              text={solSnippet}
              showLineNumbers={false}
              theme={dracula}
              wrapLongLines={true}
              codeBlock
            />
            <Typography mt={1}>Function use:</Typography>
            <CopyBlock
              language={'javascript'}
              text={usageSnippet}
              showLineNumbers={false}
              theme={dracula}
              wrapLongLines={true}
              codeBlock
            />
            <Typography mt={1}>Compact:</Typography>
            <CopyBlock
              language={'javascript'}
              text={solCompact}
              showLineNumbers={false}
              theme={dracula}
              wrapLongLines={true}
              codeBlock
            />
          </>
        )}
      </List>
      <div>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={{
              position: 'absolute' as 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'background.paper',
              border: '2px solid #000',
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Setting
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2, mb: 2 }}>
              Setup your own{' '}
              <Link style={{ color: 'red' }} target="_blank" href="https://chainbase.com/">
                CHAINBASE API KEY
              </Link>
              :
            </Typography>
            <TextField
              sx={{ width: '100%' }}
              id="outlined-basic"
              label="api_key"
              variant="outlined"
              value={key}
              onChange={(e) => {
                setKey(e.target.value)
              }}
              error={!!token && !isAddress(token)}
              helperText={!!token && !isAddress(token) && 'Invalid address.'}
            />
            <Button
              sx={{ mt: 2 }}
              variant="contained"
              disabled={false}
              onClick={() => {
                localStorage.setItem('chainbase-key', key)
                handleClose()
              }}
            >
              SAVE
            </Button>
          </Box>
        </Modal>
      </div>
    </Box>
  )
}
