import React, {useState, useEffect, Fragment} from 'react';
import { Box, Text, useInput } from 'ink';
import { listCommits } from './git/listCommits';

export interface GitBrowserProps {
  width: number;
  height: number;
  selected: string;
  setSelected: (hash: string) => void;
}

export const GitBrowser = ({ width, height, selected, setSelected }: GitBrowserProps) => {
  const [commits, setCommits] = useState([]);
  const [cursor, setCursor] = useState(0);
  const minCursor = 0;
  const maxCursor = commits.length - 1;
  useInput((input, key) => {
    if (key.upArrow) {
      setCursor(x => Math.max(minCursor, x - 1));
    } else if (key.downArrow) {
      setCursor(x => Math.min(maxCursor, x + 1));
    } else if (key['return']) {
      setSelected(commits[cursor].hash);
    }
  });

  useEffect(() => {
    listCommits()
      .then(commits => setCommits(commits));
  }, []);

  const bufferSize = (height - 5)/2;
  const visibleStart = Math.max(minCursor, cursor - bufferSize);
  const visibleCommits = commits.map((x, index) => ({ ...x, index })).slice(visibleStart, cursor + 1 + bufferSize);
  const startBlankLines = Math.max(0, bufferSize - visibleStart - cursor);
  const endBlankLines = Math.max(0, 1 + bufferSize - commits.slice(cursor).length);


  return (
    <Box width={width} flexDirection="column" borderStyle="round" padding={1}>
      { Array.from({ length: startBlankLines }).map((_, i) => <Text key={`starting-blank-${i}`}> </Text>) }
      { visibleCommits.map(({ hash, summary, tags, index }) => {
        const isSelected = hash === selected;
        const active = cursor === index;
        const summaryWidth = width - 20 - (tags.join(' ').length)
        const icon = isSelected
          ? active ? '>>⭐️' : '  ⭐️'
          : active ? '>>  ' : '    '
        const emphasize = active || isSelected;
        return (
          <Box key={hash} flexDirection="row" justifyContent="flex-start">
            <>
              <Text color="blue">{icon} </Text>
              <Text color={emphasize ? "green" : undefined }>{hash} </Text>
              <Text color="gray">{tags.map(x => x + ' ').join('')}</Text>
              <Text color={emphasize ? "cyan" : undefined }>{summary.slice(0, summaryWidth)}</Text>
            </>
          </Box>
        )
      }) }
      { Array.from({ length: endBlankLines }).map((_, i) => <Text key={`ending-blank-${i}`}> </Text>) }
    </Box>
  )
};
