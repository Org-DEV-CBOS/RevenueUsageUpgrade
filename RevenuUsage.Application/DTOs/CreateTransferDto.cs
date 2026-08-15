using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RevenuUsage.Application.DTOs;
public sealed record CreateTransferDto(
    Guid CorrespondentAccountId,
    Guid BeneficiaryId,
    string Purpose,
    string ReferenceNo,
    string CreatedBy,
    DateTime TransferDate,
    decimal Amount,
    Guid transferId,
    Guid OperationTypeId,
    Guid ResourceTypeId,
    Guid UsageTypeId,
    Guid BankId);
