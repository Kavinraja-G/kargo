import { useMutation, useQuery } from '@connectrpc/connect-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Flex, message } from 'antd';
import type { JSONSchema4 } from 'json-schema';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { z } from 'zod';

import { YamlEditor } from '@ui/features/common/code-editor/yaml-editor';
import { FieldContainer } from '@ui/features/common/form/field-container';
import { getStageYAMLExample } from '@ui/features/stage/get-stage-yaml-example';
import {
  getWarehouse,
  updateResource
} from '@ui/gen/api/service/v1alpha1/service-KargoService_connectquery';
import { RawFormat } from '@ui/gen/api/service/v1alpha1/service_pb';
import schema from '@ui/gen/schema/stages.kargo.akuity.io_v1alpha1.json';
import { decodeRawData } from '@ui/utils/decode-raw-data';
import { zodValidators } from '@ui/utils/validators';

const formSchema = z.object({
  value: zodValidators.requiredString
});

export const WarehouseEditForm = () => {
  const { name: projectName, warehouseName } = useParams();
  const { data, isLoading } = useQuery(getWarehouse, {
    project: projectName,
    name: warehouseName,
    format: RawFormat.YAML
  });

  const { mutateAsync, isPending } = useMutation(updateResource, {
    onSuccess: () => message.success('Warehouse has been updated')
  });

  const { control, handleSubmit } = useForm({
    values: {
      value: decodeRawData(data)
    },
    resolver: zodResolver(formSchema)
  });

  const onSubmit = handleSubmit(async (data) => {
    const textEncoder = new TextEncoder();
    await mutateAsync({
      manifest: textEncoder.encode(data.value)
    });
  });

  return (
    <>
      <FieldContainer name='value' control={control}>
        {({ field: { value, onChange } }) => (
          <YamlEditor
            value={value}
            onChange={(e) => onChange(e || '')}
            height='500px'
            schema={schema as JSONSchema4}
            placeholder={projectName && getStageYAMLExample(projectName)}
            isLoading={isLoading}
            isHideManagedFieldsDisplayed
            label='YAML'
            resourceType='warehouses'
          />
        )}
      </FieldContainer>

      <Flex justify='flex-end'>
        <Button type='primary' onClick={onSubmit} loading={isPending}>
          Update
        </Button>
      </Flex>
    </>
  );
};
