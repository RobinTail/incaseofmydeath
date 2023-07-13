import {
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Paper,
  Typography,
} from "@mui/material";
import React from "react";

interface ConsentProps {
  signedBy: string;
  repo: string;
  workflow: string;
  isLoading: boolean;
  onAgree: () => void;
  onReset: () => void;
}

const consentLabels: React.ReactElement[] = [
  <span>
    I understand that the Application will consider that my <em>death</em>{" "}
    occurred if it cannot contact me in the way I indicate within the time I
    specify.
  </span>,
  <span>
    I understand that this mechanism for determining the fact of <em>death</em>{" "}
    is not ideally accurate, but nevertheless I make the specified decision on
    my own and I take the risk that the specified will can be executed if I am
    not <em>dead</em> (for example, if I am unconscious, or I am in prison, or I
    lost my phone, or for some other reason I do not have access to
    communication).
  </span>,
  <span>
    I understand that using the Application does not replace notarial
    certification of my last will and other procedures established by the law of
    my country for the official transfer of property and inheritance rights.
  </span>,
  <span>
    I certify that the specified workflow was created and verified by me, it
    does not carry out illegal actions, does not violate the rights of third
    parties, is not capable of harming me and other people and organizations,
    does not violate the laws of my country and the Federal Republic of Germany.
  </span>,
];
const noConsent: false[] = consentLabels.map(() => false);

export const Consent = ({
  signedBy,
  workflow,
  repo,
  isLoading,
  onAgree,
  onReset,
}: ConsentProps) => {
  const [consent, setConsent] = React.useState<boolean[]>(noConsent);

  const today = new Date();
  const lastConsentIndex = consent.lastIndexOf(true);
  const hasConsent = consent.reduce((carry, entry) => carry && entry, true);

  return (
    <>
      <Typography variant="body2" align="left" mt={2}>
        In case you are planning suicide, someone should tell you that your life
        DOES matter. You should not be ashamed of who you are, and every
        decision you ever made was right at that time. There is a counseling
        service in your city that can help you cope with a crisis.
      </Typography>

      <Paper sx={{ p: 2, mt: 3, mb: 2, textAlign: "left" }}>
        <Typography>
          I do authorize the Application to fulfill my last will by executing
          the workflow <strong>{workflow}</strong> located in the private
          repository <strong>{repo}</strong> on GitHub in case of my{" "}
          <em>death</em>.
        </Typography>
        {consentLabels.map((label, index) => (
          <FormControlLabel
            key={index}
            control={
              <Checkbox
                onChange={(event) => {
                  setConsent(
                    consent.map((entry, offset) =>
                      offset === index ? event.target.checked : entry,
                    ),
                  );
                }}
              />
            }
            sx={{ mt: 2 }}
            label={label}
            checked={consent[index]}
            disabled={index > lastConsentIndex + 1}
          />
        ))}
        <Typography sx={{ mt: 2 }}>
          {signedBy}, on {today.toLocaleDateString()}.
        </Typography>
      </Paper>

      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 3 }}
        disabled={!hasConsent || isLoading}
        onClick={onAgree}
        endIcon={isLoading && <CircularProgress size="1.5rem" />}
      >
        I Do Agree
      </Button>
      <Button
        fullWidth
        variant="outlined"
        sx={{ mt: 2, mb: 2 }}
        onClick={() => {
          setConsent(noConsent);
          onReset();
        }}
      >
        Reset
      </Button>
    </>
  );
};
