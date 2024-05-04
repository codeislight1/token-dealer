import { NETWORKS, uniswapTokensListUrl } from '@/src/config'
import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Modal,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { CopyBlock, dracula } from 'react-code-blocks'
import SettingsIcon from '@mui/icons-material/Settings'
import { isAddress } from 'viem'
import Link from 'next/link'

export const getStaticProps = async () => {
  const axios = require('axios')
  const res = await axios({
    url: uniswapTokensListUrl,
    method: 'GET',
    headers: {
      accept: 'application/json',
    },
  })

  let tokensList: any = {}
  let tokens = res.data.tokens
  Object.values(NETWORKS).map((id) => {
    let _tokens = tokens.filter((t: any) => t['chainId'] === id)
    _tokens = _tokens.map((t: any) => ({ ...t, label: `${t['symbol']} | ${t['name']}` }))
    tokensList[id] = _tokens
  })
  // console.log('json token list res', res)

  return { props: { tokensList } }
}

export default function Home({ tokensList }: { tokensList: any }) {
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const [checked, setChecked] = useState(true)

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

  console.log('lol', tokensList[network])
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <List sx={{ width: '600px' }}>
        <ListItem sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <FormControlLabel
            sx={{ justifyContent: 'flex-start' }}
            value="top"
            checked={checked}
            control={
              <Switch
                color="primary"
                onChange={(e) => {
                  setChecked(e.target.checked)
                  setResultStatus(false)
                }}
              />
            }
            label="Use Token List"
            labelPlacement="start"
          />
          <IconButton sx={{ justifyContent: 'flex-end' }} color="primary" onClick={handleOpen}>
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
              {Object.entries(NETWORKS).map(([k, v]) =>
                !checked || (tokensList as any)[v].length > 0 ? (
                  <MenuItem value={v.toString()}>{k}</MenuItem>
                ) : (
                  ''
                )
              )}
            </Select>
          </FormControl>
        </ListItem>
        <ListItem>
          {checked ? (
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              onChange={(e, v: any) => {
                console.log(v)
                if (v) setToken(v['address'])
              }}
              options={tokensList[network] ?? []}
              sx={{ width: '100%' }}
              renderInput={(params) => <TextField {...params} label="Token" />}
            />
          ) : (
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
          )}
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
                .then((response: { data: Object }) => {
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
                .catch((error: Object) => console.log('⭕ error while querying:', error))
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
            {checked && <Typography>Token Address: {token}</Typography>}
            <Typography>Whale Address: {whale}</Typography>
            <Typography>Amount: {amount}</Typography>
            {Number(usdAmount) > 0 && <Typography>USD Value: {usdAmount}</Typography>}
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
