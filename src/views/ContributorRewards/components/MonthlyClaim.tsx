import React, { useMemo } from 'react'
import { Box, Button, CardActions, Spacer, Surface } from 'react-neu'
import styled from 'styled-components'
import useWallet from 'hooks/useWallet'
import MonthsDropdown from './MonthsDropdown'
import useRewards from 'hooks/useRewards'

const MonthlyClaim: React.FC = () => {
  const { claimableQuantity, onClaimRewards } = useRewards()
  const { status } = useWallet()

  const ClaimButton = useMemo(() => {
    if (status === 'connected' && !claimableQuantity?.isZero()) {
      return <Button full onClick={onClaimRewards} text='Claim' />
    }
    return <Button disabled full text='Claim' variant='secondary' />
  }, [status, onClaimRewards, claimableQuantity])

  return (
    <Surface elevation='N1'>
      <Box padding={1}>
        <Spacer size='sm' />
        <StyledRewardCardClaim>
          <MonthsDropdown />
          <StyledSectionTitle>
            {status === 'connected' ? claimableQuantity?.toString() || 0 : '--'}
            <StyledTokenIcon
              alt='owl icon'
              src='https://index-dao.s3.amazonaws.com/owl.png'
            />
          </StyledSectionTitle>
          <StyledSectionLabel>Unclaimed INDEX</StyledSectionLabel>
        </StyledRewardCardClaim>
        <CardActions>{ClaimButton}</CardActions>
      </Box>
    </Surface>
  )
}

const StyledTokenIcon = styled.img`
  height: 20px;
  margin-left: 10px;
`

const StyledSectionTitle = styled.span`
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 24px;
  padding-left: 8px;
`
const StyledSectionLabel = styled.span`
  color: ${(props) => props.theme.colors.grey[500]};
  font-size: 16px;
  padding-left: 8px;
`
const StyledRewardCardClaim = styled.div`
  margin: 24px;
`

export default MonthlyClaim
