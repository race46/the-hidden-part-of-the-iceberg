import {
  LISTING_AGENCY_COMMISSION_PERCENTAGE,
  LISTING_AGENT_COMMISSION_PERCENTAGE,
  SELLING_AGENCY_COMMISSION_PERCENTAGE,
  SELLING_AGENT_COMMISSION_PERCENTAGE,
  SERVICE_FEE,
} from './agreement.constants';

export function calculateListingAgentPortion() {
  return (SERVICE_FEE * LISTING_AGENT_COMMISSION_PERCENTAGE) / 100;
}

export function calculateListingAgencyPortion() {
  return (SERVICE_FEE * LISTING_AGENCY_COMMISSION_PERCENTAGE) / 100;
}

export function calculateSellingAgentPortion() {
  return (SERVICE_FEE * SELLING_AGENT_COMMISSION_PERCENTAGE) / 100;
}

export function calculateSellingAgencyPortion() {
  return (SERVICE_FEE * SELLING_AGENCY_COMMISSION_PERCENTAGE) / 100;
}
